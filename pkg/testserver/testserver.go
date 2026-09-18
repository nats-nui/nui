package testserver

import (
	"errors"
	"fmt"
	"time"

	"github.com/nats-io/nats-server/v2/server"
)

type Option func(*TestServer)

type TestServer struct {
	options  []func(*TestServer)
	Options  *server.Options
	Server   *server.Server
	tearDown TearDownFunc
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

func WithDefaultAccount() Option {
	return func(ts *TestServer) {
		defaultAccount := server.NewAccount("DEFAULT")
		defaultUser := &server.User{
			Username: "default",
			Password: "default",
			Account:  defaultAccount,
		}
		ts.Options.Accounts = append(ts.Options.Accounts, defaultAccount)
		ts.Options.Users = append(ts.Options.Users, defaultUser)
		ts.Options.NoAuthUser = "default"

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
		ts.Options.Accounts = append(ts.Options.Accounts, sysAccount)
		ts.Options.Users = append(ts.Options.Users, sysUser)
	}
}

// WithTLS enables TLS on the server with optional client-cert verification and handshake-first.
func WithTLS(certFile, keyFile, caFile string, handshakeFirst bool) Option {
	return func(ts *TestServer) {
		tc := &server.TLSConfigOpts{
			CertFile:       certFile,
			KeyFile:        keyFile,
			CaFile:         caFile,
			Verify:         true,
			Timeout:        2.0,
			HandshakeFirst: handshakeFirst,
		}
		tlsConfig, err := server.GenTLSConfig(tc)
		if err != nil {
			panic(fmt.Sprintf("failed to build TLS config: %v", err))
		}
		ts.Options.TLSConfig = tlsConfig
		ts.Options.TLSTimeout = tc.Timeout
		ts.Options.TLSVerify = true
		ts.Options.TLSHandshakeFirst = handshakeFirst
	}
}

type TearDownFunc func()

func (ts *TestServer) Run() (*server.Server, TearDownFunc, error) {
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
				ts.enableJetstreamOnAccounts(natsServer)
				ts.tearDown = func() { natsServer.Shutdown() }
				return natsServer, ts.tearDown, nil
			}
		}
	}
}

func (ts *TestServer) enableJetstreamOnAccounts(natsServer *server.Server) {
	for _, a := range ts.Options.Accounts {
		acc, err := natsServer.LookupAccount(a.Name)
		if err != nil {
			fmt.Errorf("failed to lookup account %s: %v", a.Name, err)
		}
		err = acc.EnableJetStream(nil, nil)
		if err != nil {
			fmt.Errorf("failed to enable JetStream for account %s: %v", a.Name, err)
		}
	}
}

func (ts *TestServer) TearDown() {
	if ts.tearDown != nil {
		ts.tearDown()
	}
	ts.Server = nil
}
