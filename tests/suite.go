package tests

import (
	"context"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/pricelessrabbit/nui/nuiapp"
	"github.com/stretchr/testify/suite"
	"math/rand"
	"strconv"
	"sync"
	"time"
)

type NuiTestSuite struct {
	suite.Suite
	NatsServer          *server.Server
	NuiServer           *nuiapp.App
	NuiServerCancelFunc context.CancelFunc
	natsServerOpts      *server.Options
}

func (suite *NuiTestSuite) SetupSuite() {
	suite.natsServerOpts = &server.Options{
		Host:   "localhost",
		Port:   -1,
		NoLog:  true,
		NoSigs: true,
	}
}

func (suite *NuiTestSuite) SetupTest() {
	var err error
	suite.NatsServer, err = server.NewServer(suite.natsServerOpts)
	suite.NoError(err)

	w := sync.WaitGroup{}
	w.Add(1)
	go func() {
		suite.NatsServer.Start()
		for _ = range time.Tick(20) {
			if suite.NatsServer.Running() {
				w.Done()
				return
			}
		}
	}()
	w.Wait()
	nuiSvc, err := nuiapp.Setup(":memory:")
	suite.NoError(err)

	suite.NuiServer = nuiapp.NewServer(strconv.Itoa(rand.Intn(1000)+4000), nuiSvc)
	ctx, c := context.WithCancel(context.Background())
	suite.NuiServerCancelFunc = c
	go func() {
		err = suite.NuiServer.Start(ctx)
		suite.NoError(err)
	}()

}

func (suite *NuiTestSuite) TearDownTest() {
	suite.NatsServer.Shutdown()
}

func (suite *NuiTestSuite) NuiHost(s string) string {
	return "http://localhost:" + suite.NuiServer.Port + s
}
