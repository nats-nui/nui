package tests

import (
	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/suite"
	"net/http"
	"testing"
	"time"
)

func (s *NuiTestSuite) TestConnectionsRest() {
	e := s.e

	e.GET("/api/connection").
		Expect().
		Status(http.StatusOK).JSON().Array().IsEmpty()

	newConn := `{
		"name": "c1",
		"hosts": ["host1", "host2"],
		"subscriptions": [{"subject": "sub1"}, {"subject": "sub2"}]
	}`

	e.POST("/api/connection").
		WithBytes([]byte(newConn)).
		Expect().
		Status(http.StatusOK).
		JSON().Object().ContainsKey("id")

	a := e.GET("/api/connection").
		Expect().
		Status(http.StatusOK).JSON().Array()
	a.Length().IsEqual(1)
	a.Value(0).Object().Value("name").IsEqual("c1")
	a.Value(0).Object().Value("hosts").Array().Value(0).String().IsEqual("host1")
	a.Value(0).Object().Value("hosts").Array().Value(1).String().IsEqual("host2")
	a.Value(0).Object().Value("subscriptions").Array().Value(0).Object().Value("subject").String().IsEqual("sub1")
	a.Value(0).Object().Value("subscriptions").Array().Value(1).Object().Value("subject").String().IsEqual("sub2")

	id := a.Value(0).Object().Value("id").String().Raw()

	updatedConn := `{
		"name": "c1_updated",
		"hosts": ["host2", "host3"],
		"subscriptions": [{"subject": "sub1_updated"}, {"subject": "sub2_updated"}]
	}`

	e.POST("/api/connection/" + id).
		WithBytes([]byte(updatedConn)).
		Expect().
		Status(http.StatusOK)

	a = e.GET("/api/connection").
		Expect().
		Status(http.StatusOK).JSON().Array()
	a.Length().IsEqual(1)
	a.Value(0).Object().Value("name").IsEqual("c1_updated")
	a.Value(0).Object().Value("hosts").Array().Value(0).String().IsEqual("host2")
	a.Value(0).Object().Value("subscriptions").Array().Value(0).Object().Value("subject").String().IsEqual("sub1_updated")
}

func (s *NuiTestSuite) TestStreamRest() {
	e := s.e
	connId := s.defaultConn()

	e.POST("/api/connection/" + connId + "/stream").
		WithBytes([]byte(`{"name": "stream1", "subjects": ["sub1", "sub2"]}`)).
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("name").String().IsEqual("stream1")

	a := e.GET("/api/connection/" + connId + "/stream/stream1").
		Expect().
		Status(http.StatusOK).JSON().Object()
	a.Value("name").String().IsEqual("stream1")
	a.Value("subjects").Array().ContainsAll("sub1", "sub2")

}

func (s *NuiTestSuite) TestRequestResponseRest() {
	connId := s.defaultConn()

	// create a subscription with s.nc that wait for requests and say "hi" as response
	sub, _ := s.nc.Subscribe("request_sub", func(m *nats.Msg) {
		err := s.nc.Publish(m.Reply, []byte("hi"))
		s.NoError(err)
	})
	defer sub.Unsubscribe()
	time.Sleep(10 * time.Millisecond)

	//send request and read response via nui rest
	s.e.POST("/api/connection/" + connId + "/request").
		WithBytes([]byte(`{"subject": "request_sub", "payload": ""}`)).
		Expect().Status(http.StatusOK).JSON().Object().Value("payload").String().IsEqual("aGk=")

}

func (s *NuiTestSuite) TestPubSubWs() {
	connId := s.defaultConn()
	ws := s.ws("/ws/sub", "id="+connId)
	ws2 := s.ws("/ws/sub", "id="+connId)
	defer ws.Disconnect()
	defer ws2.Disconnect()
	ws.WriteText(`{"type": "subscriptions_req", "payload": {"subjects": ["sub1"]}}`)
	ws2.WriteText(`{"type": "subscriptions_req", "payload": {"subjects": ["sub1"]}}`)

	time.Sleep(10 * time.Millisecond)
	s.e.POST("/api/connection/" + connId + "/publish").
		WithBytes([]byte(`{"subject": "sub1", "payload": "aGk="}`)).
		Expect().Status(http.StatusOK)

	ws.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("connected")
	ws.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("aGk=")
	ws2.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("connected")
	ws2.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("aGk=")
}

func (s *NuiTestSuite) TestConnectionEventsWs() {
	s.NatsServer.Shutdown()
	time.Sleep(10 * time.Millisecond)
	connId := s.defaultConn()
	ws := s.ws("/ws/sub", "id="+connId)
	defer ws.Disconnect()

	ws.WithReadTimeout(200 * time.Millisecond).Expect().Body().Contains("disconnected")
	s.startNatsServer()

	ws.WithReadTimeout(5000 * time.Millisecond).Expect().Body().Contains("connected")

	ws2 := s.ws("/ws/sub", "id="+connId)
	defer ws2.Disconnect()
	ws2.WithReadTimeout(200 * time.Millisecond).Expect().Body().Contains("connected")

	s.NatsServer.Shutdown()
	ws.WithReadTimeout(200 * time.Millisecond).Expect().Body().Contains("disconnected")
	ws2.WithReadTimeout(200 * time.Millisecond).Expect().Body().Contains("disconnected")
}

func TestNuiTestSuite(t *testing.T) {
	suite.Run(t, new(NuiTestSuite))
}
