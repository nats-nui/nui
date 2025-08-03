package tests

import (
	"context"
	"github.com/gavv/httpexpect/v2"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/nui"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/nats-nui/nui/pkg/testserver"
	"github.com/stretchr/testify/suite"
	"math/rand"
	"net/http"
	"strconv"
)

type NuiTestSuite struct {
	suite.Suite
	ctx                 context.Context
	NatsServer          *server.Server
	NuiService          *nui.Nui
	NuiServer           *nui.App
	nuiServerPort       string
	NuiServerCancelFunc context.CancelFunc
	natsServerOpts      *server.Options
	testServer          *testserver.TestServer
	e                   *httpexpect.Expect
	nc                  *nats.Conn
	js                  jetstream.JetStream
}

func (s *NuiTestSuite) SetupSuite() {
}

func (s *NuiTestSuite) SetupTest() {
	s.ctx = context.Background()
	s.testServer = testserver.Build(testserver.WithPort(8080), testserver.WithDefaultAccount(), testserver.WithSysAccount("sys"))
	s.natsServerOpts = s.testServer.Options
	s.nuiServerPort = strconv.Itoa(rand.Intn(1000) + 3000)
	s.e = s.newE()
	s.startNatsServer()
	s.startNuiServer()
	s.connectNatsClient()
}

func (s *NuiTestSuite) connectNatsClient() {
	nc, err := nats.Connect(s.NatsServer.Addr().String())
	s.NoError(err)
	s.nc = nc
	js, err := jetstream.New(nc)
	s.NoError(err)
	s.js = js
}

func (s *NuiTestSuite) startNuiServer() {

	mockedLogger := &logging.NullLogger{}
	nuiSvc, err := nui.Setup(":memory:", mockedLogger)
	s.NoError(err)

	s.NuiServer = nui.NewServer(s.nuiServerPort, nuiSvc, mockedLogger, false)
	ctx, c := context.WithCancel(context.Background())
	s.NuiServerCancelFunc = c
	go func() {
		err = s.NuiServer.Start(ctx)
		s.NoError(err)
	}()
	s.e.GET("/health").WithMaxRetries(5).WithRetryPolicy(httpexpect.RetryAllErrors).Expect().Status(http.StatusOK)
}

func (s *NuiTestSuite) startNatsServer() {
	natsServer, _, err := s.testServer.Run()
	s.NoError(err)
	s.NatsServer = natsServer
}

func (s *NuiTestSuite) newE() *httpexpect.Expect {
	e := httpexpect.Default(s.T(), s.nuiHost())
	e = e.Builder(func(req *httpexpect.Request) {
		req.WithHeader("Content-Type", "application/json")
	})
	return e
}

func (s *NuiTestSuite) TearDownTest() {
	s.testServer.TearDown()
	s.NuiServerCancelFunc()
	s.nc.Close()
}

func (s *NuiTestSuite) ws(path, query string) *httpexpect.Websocket {
	return s.newE().GET(path).WithQueryString(query).WithWebsocketUpgrade().
		Expect().Status(http.StatusSwitchingProtocols).
		Websocket()
}

func (s *NuiTestSuite) nuiHost() string {
	return "http://localhost:" + s.nuiServerPort
}
