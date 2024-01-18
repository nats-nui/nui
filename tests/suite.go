package tests

import (
	"context"
	"github.com/gavv/httpexpect/v2"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/pricelessrabbit/nui/nui"
	"github.com/stretchr/testify/suite"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type NuiTestSuite struct {
	suite.Suite
	NatsServer          *server.Server
	NuiServer           *nui.App
	nuiServerPort       string
	NuiServerCancelFunc context.CancelFunc
	natsServerOpts      *server.Options
	e                   *httpexpect.Expect
	nc                  *nats.Conn
}

func (s *NuiTestSuite) SetupSuite() {
	s.natsServerOpts = &server.Options{
		Host:               "localhost",
		JetStream:          true,
		NoLog:              false,
		NoSigs:             false,
		JetStreamMaxMemory: 1024 * 1024,
		JetStreamMaxStore:  -1,
	}
}

func (s *NuiTestSuite) SetupTest() {
	s.natsServerOpts.Port = rand.Intn(1000) + 4000
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
}

func (s *NuiTestSuite) startNuiServer() {
	nuiSvc, err := nui.Setup(":memory:")
	s.NoError(err)

	s.NuiServer = nui.NewServer(s.nuiServerPort, nuiSvc)
	ctx, c := context.WithCancel(context.Background())
	s.NuiServerCancelFunc = c
	go func() {
		err = s.NuiServer.Start(ctx)
		s.NoError(err)
	}()
	s.e.GET("/health").WithMaxRetries(5).WithRetryPolicy(httpexpect.RetryAllErrors).Expect().Status(http.StatusOK)
}

func (s *NuiTestSuite) startNatsServer() {
	natsServer, err := server.NewServer(s.natsServerOpts)
	s.NoError(err)
	s.NatsServer = natsServer
	w := sync.WaitGroup{}
	w.Add(1)
	go func() {
		s.NatsServer.Start()
		for _ = range time.Tick(20) {
			if s.NatsServer.Running() {
				w.Done()
				return
			}
		}
	}()
	w.Wait()
}

func (s *NuiTestSuite) newE() *httpexpect.Expect {
	e := httpexpect.Default(s.T(), s.nuiHost())
	e = e.Builder(func(req *httpexpect.Request) {
		req.WithHeader("Content-Type", "application/json")
	})
	return e
}

func (s *NuiTestSuite) TearDownTest() {
	s.NatsServer.Shutdown()
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
