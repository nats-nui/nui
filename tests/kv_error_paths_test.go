package tests

import "net/http"

// A failed bucket lookup must answer with an HTTP error and leave the server running.
// bucketOrFail and jsOrFail already write the error response and hand back the
// result of that write (nil), so a handler that reports it a second time
// dereferenced a nil error and took the whole process down.
func (s *NuiTestSuite) TestKvErrorPathsDoNotCrash() {
	e := s.e
	connId := s.defaultConn()

	e.GET("/api/connection/" + connId + "/kv/missing-bucket/key").Expect().Status(http.StatusNotFound)
	e.GET("/api/connection/" + connId + "/kv/missing-bucket").Expect().Status(http.StatusNotFound)
	e.DELETE("/api/connection/" + connId + "/kv/missing-bucket").Expect().Status(http.StatusNotFound)
	e.GET("/api/connection/no-such-connection/kv/bucket1/key").Expect().Status(http.StatusUnprocessableEntity)

	e.GET("/health").Expect().Status(http.StatusOK)
}
