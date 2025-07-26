package testserver

import (
	"errors"
	"github.com/nats-io/nats-server/v2/server"
	"time"
)

type Option func(*TestServer)

type TestServer struct {
	options []func(*TestServer)
	Options *server.Options
}

func Build(opts ...Option) *TestServer {
	ts := &TestServer{}
	ts.Options = &server.Options{
		Host:               "127.0.0.1",
		JetStream:          true,
		NoLog:              false,
		NoSigs:             false,
		JetStreamMaxMemory: 1024 * 1024,
		JetStreamMaxStore:  -1,
	}
	for _, opt := range opts {
		opt(ts)
	}
	return ts
}

func WithPort(port int) Option {
	return func(ts *TestServer) {
		ts.Options.Port = port
	}
}

func WithSysAccount(userpass string) Option {
	return func(ts *TestServer) {
		sysAccount := server.NewAccount("SYS")
		sysUser := &server.User{
			Username: userpass,
			Password: userpass,
			Account:  sysAccount,
		}
		ts.Options.SystemAccount = "SYS"
		ts.Options.Accounts = []*server.Account{sysAccount}
		ts.Options.Users = []*server.User{sysUser}
	}
}

type TearDown func()

func (ts *TestServer) Run() (*server.Server, TearDown, error) {
	natsServer, err := server.NewServer(ts.Options)
	if err != nil {
		return nil, nil, err
	}
	natsServer.Start()
	timeout := time.After(5 * time.Second)
	tick := time.Tick(20 * time.Millisecond)
	for {
		select {
		case <-timeout:
			return nil, nil, errors.New("timeout waiting for NATS server to start")
		case <-tick:
			if natsServer.Running() {
				return natsServer, func() { natsServer.Shutdown() }, nil
			}
		}
	}
}
