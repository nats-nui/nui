package tests

import (
	"github.com/stretchr/testify/suite"
	"net/http"
	"testing"
	"time"
)

func (s *NuiTestSuite) TestConnectionsCrud() {
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

func (s *NuiTestSuite) TestPubSub() {
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

	ws.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("aGk=")
	ws2.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("aGk=")
}

func TestNuiTestSuite(t *testing.T) {
	suite.Run(t, new(NuiTestSuite))
}
