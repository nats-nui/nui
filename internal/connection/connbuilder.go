package connection

import (
	"context"
	"net"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
)

type ConnBuilder[T Conn] func(connection *Connection) (T, error)

func NatsBuilder(connection *Connection) (*NatsConn, error) {
	options := []nats.Option{
		nats.RetryOnFailedConnect(true),
		nats.MaxReconnects(-1),
		nats.PingInterval(2 * time.Second),
		nats.MaxPingsOutstanding(3),
	}
	options = appendConnectionNameOption(connection, options)
	options = appendAuthOption(connection, options)
	options = appendTLSAuthOptions(connection, options)
	options = appendInboxPrefixOption(connection, options)
	return NewNatsConn(strings.Join(connection.Hosts, ", "), options...)
}

// DialOnce opens an unpooled connection without reconnecting. The caller must close it.
func DialOnce(ctx context.Context, connection *Connection) (*nats.Conn, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	options := []nats.Option{
		nats.NoReconnect(),
		nats.Name(CONNECTION_NAME_NUI_PREFIX + connection.Name + "-subjects"),
		nats.SkipHostLookup(), // Let DialContext handle DNS with the same cancellation.
		nats.SetCustomDialer(&contextDialer{ctx: ctx}),
	}
	options = appendAuthOption(connection, options)
	options = appendTLSAuthOptions(connection, options)
	options = appendInboxPrefixOption(connection, options)
	nc, err := nats.Connect(strings.Join(connection.Hosts, ", "), options...)
	if ctx.Err() != nil {
		if nc != nil {
			nc.Close()
		}
		return nil, ctx.Err()
	}
	return nc, err
}

// Closing the socket on cancellation also interrupts the NATS/TLS handshake,
// which happens after DialContext returns.
type contextDialer struct {
	ctx context.Context
}

func (d *contextDialer) Dial(network, address string) (net.Conn, error) {
	dialer := net.Dialer{Timeout: nats.DefaultTimeout}
	conn, err := dialer.DialContext(d.ctx, network, address)
	if err != nil {
		return nil, err
	}
	stop := context.AfterFunc(d.ctx, func() { _ = conn.Close() })
	return &contextConn{Conn: conn, stop: stop}, nil
}

type contextConn struct {
	net.Conn
	stop func() bool
}

func (c *contextConn) Close() error {
	c.stop()
	return c.Conn.Close()
}

func appendConnectionNameOption(connection *Connection, options []nats.Option) []nats.Option {
	return append(options, nats.Name(CONNECTION_NAME_NUI_PREFIX+connection.Name))
}

func appendAuthOption(connection *Connection, options []nats.Option) []nats.Option {
	var activeAuth *Auth
	for _, auth := range connection.Auth {
		if auth.Active {
			activeAuth = &auth
			break
		}
	}
	if activeAuth == nil {
		return options
	}
	switch activeAuth.Mode {
	case "":
		return options
	case AuthModeNone:
		return options
	case AuthModeToken:
		return append(options, nats.Token(activeAuth.Token))
	case AuthModeUserPassword:
		return append(options, nats.UserInfo(activeAuth.Username, activeAuth.Password))
	case AuthModeNKey:
		return append(options, buildNkeyOption(activeAuth))
	case AuthModeJwt:
		return append(options, nats.UserJWTAndSeed(activeAuth.Jwt, activeAuth.NKeySeed))
	case AuthModeJwtBearer:
		return append(options, buildJwtBearerOption(activeAuth))
	case AuthModeCredsFile:
		return append(options, nats.UserCredentials(activeAuth.Creds))
	}
	return options
}
