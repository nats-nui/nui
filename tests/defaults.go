package tests

import (
	"fmt"
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
