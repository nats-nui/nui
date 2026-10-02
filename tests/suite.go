package tests

import (
	"context"
	"math/rand"
	"net/http"
	"strconv"

	"github.com/gavv/httpexpect/v2"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/nui"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/nats-nui/nui/pkg/testserver"
	"github.com/stretchr/testify/suite"
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

func (s *NuiTestSuite) stopNuiServer() {
	if s.NuiServerCancelFunc != nil {
		s.NuiServerCancelFunc()
		s.NuiServerCancelFunc = nil
	}
}

func (s *NuiTestSuite) startNuiServer(opts ...nui.Option) {
	s.stopNuiServer()
	mockedLogger := &logging.NullLogger{}
	s.NuiService = s.newNui(opts...)
	s.NuiServer = nui.NewServer(s.nuiServerPort, s.NuiService, mockedLogger, false)
	ctx, cancel := context.WithCancel(context.Background())
	s.NuiServerCancelFunc = cancel
	go func() {
		err := s.NuiServer.Start(ctx)
		s.NoError(err)
	}()
	s.e.GET("/health").WithMaxRetries(5).WithRetryPolicy(httpexpect.RetryAllErrors).Expect().Status(http.StatusOK)
}

func (s *NuiTestSuite) defaultNuiOptions() []nui.Option {
	return []nui.Option{
		nui.WithDBPath(":memory:"),
		nui.WithProtoSchemasPath("./protoschemas/default"),
		nui.WithCddlSchemasPath("./cddlschemas/default"),
		nui.WithLogger(&logging.NullLogger{}),
	}
}

func (s *NuiTestSuite) newNui(opts ...nui.Option) *nui.Nui {
	nuiSvc, err := nui.New(append(s.defaultNuiOptions(), opts...)...)
	s.Require().NoError(err)
	return nuiSvc
}

// stopNatsServer shuts down the NATS test server if one is running.
func (s *NuiTestSuite) stopNatsServer() {
	if s.testServer != nil {
		s.testServer.TearDown()
	}
	if s.nc != nil {
		s.nc.Close()
		s.nc = nil
	}
	s.NatsServer = nil
}

// startNatsServer stops any running NATS server, then starts one with suite defaults
// plus any extra opts (e.g. WithTLS).
func (s *NuiTestSuite) startNatsServer(opts ...testserver.Option) {
	s.stopNatsServer()
	base := []testserver.Option{
		testserver.WithPort(8080),
		testserver.WithDefaultAccount(),
		testserver.WithSysAccount("sys"),
	}
	s.testServer = testserver.Build(append(base, opts...)...)
	s.natsServerOpts = s.testServer.Options
	natsServer, _, err := s.testServer.Run()
	s.NoError(err)
	s.NatsServer = natsServer
}

func (s *NuiTestSuite) newExpect(baseURL string) *httpexpect.Expect {
	return httpexpect.Default(s.T(), baseURL).Builder(func(req *httpexpect.Request) {
		req.WithHeader("Content-Type", "application/json")
	})
}

func (s *NuiTestSuite) newE() *httpexpect.Expect {
	return s.newExpect(s.nuiHost())
}

func (s *NuiTestSuite) TearDownTest() {
	s.stopNatsServer()
	s.testServer = nil
	s.natsServerOpts = nil
	s.stopNuiServer()
}

func (s *NuiTestSuite) ws(path, query string) *httpexpect.Websocket {
	return s.newE().GET(path).WithQueryString(query).WithWebsocketUpgrade().
		Expect().Status(http.StatusSwitchingProtocols).
		Websocket()
}

func (s *NuiTestSuite) nuiHost() string {
	return "http://localhost:" + s.nuiServerPort
}
