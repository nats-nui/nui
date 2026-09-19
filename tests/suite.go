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
	nuiServerDone       chan struct{}
	dbPath              string
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

func (s *NuiTestSuite) startNuiServer() {
	path := s.dbPath
	if path == "" {
		path = ":memory:"
	}

	mockedLogger := &logging.NullLogger{}
	nuiSvc, err := nui.Setup(path, "./protoschemas/default", "./cddlschemas/default", mockedLogger)
	s.NoError(err)
	s.NuiService = nuiSvc

	server := nui.NewServer(s.nuiServerPort, nuiSvc, mockedLogger, false)
	s.NuiServer = server
	ctx, c := context.WithCancel(context.Background())
	s.NuiServerCancelFunc = c
	s.nuiServerDone = make(chan struct{})
	go func() {
		defer close(s.nuiServerDone)
		err := server.Start(ctx)
		if ctx.Err() == nil {
			s.NoError(err)
		}
	}()
	s.e.GET("/health").WithMaxRetries(5).WithRetryPolicy(httpexpect.RetryAllErrors).Expect().Status(http.StatusOK)
}

func (s *NuiTestSuite) stopNuiServer() {
	if s.NuiServerCancelFunc != nil {
		s.NuiServerCancelFunc()
		s.NuiServerCancelFunc = nil
	}
	if s.NuiServer != nil {
		_ = s.NuiServer.Shutdown()
		s.NuiServer = nil
	}
	if s.nuiServerDone != nil {
		<-s.nuiServerDone
		s.nuiServerDone = nil
	}
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

func (s *NuiTestSuite) newE() *httpexpect.Expect {
	e := httpexpect.Default(s.T(), s.nuiHost())
	e = e.Builder(func(req *httpexpect.Request) {
		req.WithHeader("Content-Type", "application/json")
	})
	return e
}

func (s *NuiTestSuite) TearDownTest() {
	s.stopNatsServer()
	s.testServer = nil
	s.natsServerOpts = nil
	s.stopNuiServer()
	s.dbPath = ""
}

func (s *NuiTestSuite) ws(path, query string) *httpexpect.Websocket {
	return s.newE().GET(path).WithQueryString(query).WithWebsocketUpgrade().
		Expect().Status(http.StatusSwitchingProtocols).
		Websocket()
}

func (s *NuiTestSuite) nuiHost() string {
	return "http://localhost:" + s.nuiServerPort
}
