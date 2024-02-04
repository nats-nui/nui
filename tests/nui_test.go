package tests

import (
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
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

	// get void list of streams
	e.GET("/api/connection/" + connId + "/stream").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(0)

	// create new one
	e.POST("/api/connection/" + connId + "/stream").
		WithBytes([]byte(`{"name": "stream1", "storage": "memory", "subjects": ["sub1", "sub2"]}`)).
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("name").String().IsEqual("stream1")

	// get list of streams with created one
	r1 := e.GET("/api/connection/" + connId + "/stream").
		Expect().
		Status(http.StatusOK).JSON().Array()
	r1.Length().IsEqual(1)
	r1.Value(0).Object().Value("config").Object().Value("name").IsEqual("stream1")

	// update stream
	e.POST("/api/connection/"+connId+"/stream/stream1").
		WithBytes([]byte(`{"name": "stream1", "storage": "memory", "subjects": ["sub1", "sub2", "sub3"]}`)).
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("config").Object().Value("subjects").
		Array().ContainsAll("sub1", "sub2", "sub3")

	// get stream by name
	r2 := e.GET("/api/connection/" + connId + "/stream/stream1").
		Expect().
		Status(http.StatusOK).JSON().Object()
	r2.Value("config").Object().Value("name").String().IsEqual("stream1")
	r2.Value("config").Object().Value("subjects").Array().ContainsAll("sub1", "sub2", "sub3")

	// delete stream
	e.DELETE("/api/connection/" + connId + "/stream/stream1").
		Expect().
		Status(http.StatusOK)

	// check list is void
	e.GET("/api/connection/" + connId + "/stream").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(0)

}

func (s *NuiTestSuite) TestStreamConsumerRest() {
	e := s.e
	connId := s.defaultConn()
	stream := s.filledStream("stream1")
	e.GET("/api/connection/" + connId + "/stream/stream1/consumer").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(0)

	// create new consumer
	_, err := stream.CreateOrUpdateConsumer(s.ctx, jetstream.ConsumerConfig{
		Name:          "consumer1",
		DeliverPolicy: jetstream.DeliverAllPolicy,
	})
	s.NoError(err)

	// check list of consumers
	r := e.GET("/api/connection/" + connId + "/stream/stream1/consumer").
		Expect().Status(http.StatusOK).JSON().Array()
	r.Length().IsEqual(1)
	r.Value(0).Object().Value("name").String().IsEqual("consumer1")

	//check consumer by name
	e.GET("/api/connection/" + connId + "/stream/stream1/consumer/consumer1").
		Expect().Status(http.StatusOK).JSON().Object().Value("name").IsEqual("consumer1")

}

func (s *NuiTestSuite) TestStreamMessagesRest() {
	e := s.e
	connId := s.defaultConn()
	s.filledStream("stream1")

	// get stream messages
	r := e.GET("/api/connection/" + connId + "/stream/stream1/messages").
		Expect().Status(http.StatusOK).JSON().Array()
	r.Length().IsEqual(15)

	// filter by interval
	e.GET("/api/connection/" + connId + "/stream/stream1/messages").
		WithQueryString("interval=5").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(5)

	// filter by sequence number
	e.GET("/api/connection/" + connId + "/stream/stream1/messages").
		WithQueryString("seq_start=6").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(10)

	// filter by subject
	e.GET("/api/connection/" + connId + "/stream/stream1/messages").
		WithQueryString("subjects=sub1").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(10)

	time.Sleep(1 * time.Second)
	//ensure no consumers are pending
	e.GET("/api/connection/" + connId + "/stream/stream1/consumer").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(0)

}

func (s *NuiTestSuite) TestKvRest() {
	e := s.e
	connId := s.defaultConn()
	s.filledKvs("bucket1")
	s.filledKvs("bucket2")

	// get existing buckets
	r := e.GET("/api/connection/" + connId + "/kv").Expect()
	r.Status(http.StatusOK).JSON().Array().Length().IsEqual(2)
	r.JSON().Array().Value(0).Object().Value("bucket").String().IsEqual("bucket1")
	r.JSON().Array().Value(0).Object().Value("values").Number().IsEqual(10)
	r.JSON().Array().Value(0).Object().Value("history").Number().IsEqual(5)

	// get existing bucket
	r = e.GET("/api/connection/" + connId + "/kv/bucket1").Expect()
	r.Status(http.StatusOK).JSON().Object().Value("bucket").String().IsEqual("bucket1")

	// create a new bucket
	e.POST("/api/connection/" + connId + "/kv").
		WithBytes([]byte(`{"bucket": "bucket3", "storage": "memory"}`)).
		Expect().Status(http.StatusOK).JSON().Object().Value("bucket").String().IsEqual("bucket3")

	// get new bucket
	e.GET("/api/connection/" + connId + "/kv/bucket3").Expect().
		JSON().Object().Value("bucket").String().IsEqual("bucket3")

	//delete new bucket
	e.DELETE("/api/connection/" + connId + "/kv/bucket3").Expect().Status(http.StatusOK)

	// get deleted bucket gives 404
	e.GET("/api/connection/" + connId + "/kv/bucket3").Expect().Status(http.StatusNotFound)

	// list bucket keys
	r = e.GET("/api/connection/" + connId + "/kv/bucket1/key").Expect()
	r.Status(http.StatusOK).JSON().Array().Length().IsEqual(10)
	r.JSON().Array().Value(0).Object().Value("key").IsEqual("key1")
	r.JSON().Array().Value(0).Object().Value("payload").IsNull()
	r.JSON().Array().Value(0).Object().Value("last_update").NotNull()
	r.JSON().Array().Value(0).Object().Value("operation").String().IsEqual("KeyValuePutOp")
	r.JSON().Array().Value(0).Object().Value("revision").Number().IsEqual(1)
	r.JSON().Array().Value(0).Object().Value("is_deleted").Boolean().IsFalse()

	//get key
	r = e.GET("/api/connection/" + connId + "/kv/bucket1/key/key1").Expect().Status(http.StatusOK)
	r.JSON().Object().Value("payload").String().IsEqual("dmFsdWUx")
	r.JSON().Object().Value("history").Array().Length().IsEqual(1)

	// put key
	r = e.POST("/api/connection/" + connId + "/kv/bucket1/key/key1").
		WithBytes([]byte(`{"payload": "dmFsdWUy"}`)).Expect().Status(http.StatusOK)
	r.JSON().Object().Value("payload").String().IsEqual("dmFsdWUy")
	r.JSON().Object().Value("history").IsNull()

	//delete key
	e.DELETE("/api/connection/" + connId + "/kv/bucket1/key/key1").Expect().Status(http.StatusNoContent)

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

	// send request and read response via nui rest
	s.e.POST("/api/connection/" + connId + "/request").
		WithBytes([]byte(`{"subject": "request_sub", "payload": ""}`)).
		Expect().Status(http.StatusOK).JSON().Object().Value("payload").String().IsEqual("aGk=")

}

func (s *NuiTestSuite) TestPubSubWs() {
	connId := s.defaultConn()

	// open the 2 ws
	ws := s.ws("/ws/sub", "id="+connId)
	ws2 := s.ws("/ws/sub", "id="+connId)
	defer ws.Disconnect()
	defer ws2.Disconnect()

	// both ws subscribe to sub1
	ws.WriteText(`{"type": "subscriptions_req", "payload": {"subjects": ["sub1"]}}`)
	ws2.WriteText(`{"type": "subscriptions_req", "payload": {"subjects": ["sub1"]}}`)
	time.Sleep(10 * time.Millisecond)

	// publish on sub1 via rest
	s.e.POST("/api/connection/" + connId + "/publish").
		WithBytes([]byte(`{"subject": "sub1", "payload": "aGk="}`)).
		Expect().Status(http.StatusOK)

	// both ws receive the connected event and the message published
	ws.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("connected")
	ws.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("aGk=")
	ws2.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("connected")
	ws2.WithReadTimeout(500 * time.Millisecond).Expect().Body().Contains("aGk=")
}

func (s *NuiTestSuite) TestConnectionEventsWs() {
	s.NatsServer.Shutdown()
	time.Sleep(10 * time.Millisecond)
	connId := s.defaultConn()

	// open the ws
	ws := s.ws("/ws/sub", "id="+connId)
	defer ws.Disconnect()

	// server is not started so ws receive the disconnected event
	ws.WithReadTimeout(200 * time.Millisecond).Expect().Body().Contains("disconnected")

	s.startNatsServer()

	// now connected event is fired
	ws.WithReadTimeout(5000 * time.Millisecond).Expect().Body().Contains("connected")

	// open a second ws and check that it receive only the connected event
	ws2 := s.ws("/ws/sub", "id="+connId)
	defer ws2.Disconnect()
	ws2.WithReadTimeout(200 * time.Millisecond).Expect().Body().Contains("connected")

	// shutdown the server and check that both ws receive the disconnected event
	s.NatsServer.Shutdown()
	ws.WithReadTimeout(200 * time.Millisecond).Expect().Body().Contains("disconnected")
	ws2.WithReadTimeout(200 * time.Millisecond).Expect().Body().Contains("disconnected")
}

func TestNuiTestSuite(t *testing.T) {
	suite.Run(t, new(NuiTestSuite))
}
