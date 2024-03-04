package tests

import (
	"fmt"
	"github.com/nats-io/nats.go/jetstream"
	"net/http"
	"strconv"
	"time"
)

func (s *NuiTestSuite) defaultConn() string {
	newConn := `{
		"name": "default",
		"hosts": ["%s"],
		"subscriptions": []
	}`
	r := s.e.POST("/api/connection").
		WithBytes([]byte(fmt.Sprintf(newConn, "localhost:"+strconv.Itoa(s.natsServerOpts.Port)))).
		Expect()

	r.Status(http.StatusOK)
	r.JSON().Object().Value("id").String().NotEmpty()
	return r.JSON().Object().Value("id").String().Raw()
}

func (s *NuiTestSuite) filledStream(name string, subjects ...string) jetstream.Stream {
	if len(subjects) == 0 {
		subjects = append(subjects, "sub1")
	}
	stream, err := s.emptyStream(name, subjects...)
	for i := 1; i <= 15; i++ {
		_, err = s.js.Publish(s.ctx, subjects[0], []byte("msg"+strconv.Itoa(i)))
		s.NoError(err)
	}
	return stream
}

func (s *NuiTestSuite) filledStreamMultiSub(name, sub1, sub2 string) jetstream.Stream {
	stream, err := s.emptyStream(name, sub1, sub2)
	for i := 1; i <= 10; i++ {
		_, err = s.js.Publish(s.ctx, sub1, []byte("msg"+strconv.Itoa(i)))
		s.NoError(err)
		if i%2 == 0 {
			_, err = s.js.Publish(s.ctx, sub2, []byte("msg"+strconv.Itoa(i)))
			s.NoError(err)
		}
	}
	return stream
}

func (s *NuiTestSuite) emptyStream(name string, subjects ...string) (jetstream.Stream, error) {

	stream, err := s.js.CreateStream(s.ctx, jetstream.StreamConfig{
		Name:     name,
		Subjects: subjects,
		Storage:  jetstream.MemoryStorage,
	})
	s.NoError(err)
	return stream, err
}

func (s *NuiTestSuite) filledKvs(name string) jetstream.KeyValue {
	kv := s.emptyKvs(name)
	for i := 1; i <= 10; i++ {
		_, err := kv.Put(s.ctx, "key"+strconv.Itoa(i), []byte("value"+strconv.Itoa(i)))
		s.NoError(err)
	}
	return kv
}

func (s *NuiTestSuite) emptyKvs(name string) jetstream.KeyValue {
	config := jetstream.KeyValueConfig{
		Bucket:      name,
		Description: "",
		History:     5,
		Storage:     jetstream.MemoryStorage,
	}

	kv, err := s.js.CreateKeyValue(s.ctx, config)
	s.NoError(err)
	return kv
}

func (s *NuiTestSuite) ensureNoNuiConsumersPending(connId, stream string) {
	time.Sleep(200 * time.Millisecond)
	s.e.GET("/api/connection/" + connId + "/stream/stream1/consumer").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(0)
}
