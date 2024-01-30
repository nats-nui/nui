package tests

import (
	"fmt"
	"github.com/nats-io/nats.go/jetstream"
	"net/http"
	"strconv"
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

func (s *NuiTestSuite) filledStream(name string) jetstream.Stream {
	stream, err := s.emptyStream(name)
	for i := 1; i <= 10; i++ {
		_, err = s.js.Publish(s.ctx, "sub1", []byte("msg"+strconv.Itoa(i)))
		s.NoError(err)
		if i%2 == 0 {
			_, err = s.js.Publish(s.ctx, "sub2", []byte("msg"+strconv.Itoa(i)))
			s.NoError(err)
		}
	}
	return stream
}

func (s *NuiTestSuite) emptyStream(name string) (jetstream.Stream, error) {
	stream, err := s.js.CreateStream(s.ctx, jetstream.StreamConfig{
		Name:     name,
		Subjects: []string{"sub1", "sub2"},
		Storage:  jetstream.MemoryStorage,
	})
	s.NoError(err)
	return stream, err
}
