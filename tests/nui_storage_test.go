package tests

import (
	"math/rand"
	"net/http"
	"strconv"

	docstore "github.com/nats-nui/nui/pkg/storage"
)

// TestStorage is the app-level profile check:
//  1. Open NUI with NUI_STORAGE_PROFILE=legacy
//  2. Write a connection through the HTTP API
//  3. Restart the same directory with min-impact
//  4. No errors; the connection is still there
func (s *NuiTestSuite) TestStorage() {
	dir := s.T().TempDir()
	s.T().Cleanup(func() { _ = docstore.ClosePath(dir) })

	s.startWithProfile(dir, "legacy")
	connId := s.defaultConn()
	s.e.GET("/api/connection/" + connId).
		Expect().Status(http.StatusOK).JSON().Object().Value("name").IsEqual("default")

	s.startWithProfile(dir, "min-impact")
	s.e.GET("/api/connection").
		Expect().Status(http.StatusOK).JSON().Array().Length().IsEqual(1)
	s.e.GET("/api/connection/" + connId).
		Expect().Status(http.StatusOK).JSON().Object().Value("name").IsEqual("default")
}

func (s *NuiTestSuite) startWithProfile(dir, profile string) {
	s.stopNuiServer()
	s.Require().NoError(docstore.ClosePath(dir))
	s.T().Setenv(docstore.EnvProfile, profile)
	s.dbPath = dir
	s.nuiServerPort = strconv.Itoa(rand.Intn(1000) + 3000)
	s.e = s.newE()
	s.startNuiServer()
}
