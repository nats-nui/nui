package connection

import (
	"github.com/nats-io/nats.go"
	"strings"
	"time"
)

type ConnBuilder[T Conn] func(connection *Connection) (T, error)

// natsConnectTimeout covers Dial plus the first CONNECT.
// The nats.go default is 2s, which misses public hosts such as
// demo.nats.io (often just over 2s away). A failed first dial then
// leaves RetryOnFailedConnect connections in RECONNECTING, so
// JetStream listing hangs until the catalog budget expires.
const natsConnectTimeout = 10 * time.Second

func NatsBuilder(connection *Connection) (*NatsConn, error) {
	options := []nats.Option{
		nats.RetryOnFailedConnect(true),
		nats.MaxReconnects(-1),
		nats.Timeout(natsConnectTimeout),
		nats.PingInterval(2 * time.Second),
		nats.MaxPingsOutstanding(3),
	}
	options = appendConnectionNameOption(connection, options)
	options = appendAuthOption(connection, options)
	options = appendTLSAuthOptions(connection, options)
	options = appendInboxPrefixOption(connection, options)
	return NewNatsConn(strings.Join(connection.Hosts, ", "), options...)
}

// DialOnce opens a short-lived NATS connection that is not pooled and does
// not reconnect. Callers must Close it. Used for Discovery listens so a
// catch-all subscribe cannot stall the shared MESSAGES connection.
func DialOnce(connection *Connection) (*nats.Conn, error) {
	options := []nats.Option{
		nats.RetryOnFailedConnect(false),
		nats.MaxReconnects(0),
		nats.Timeout(natsConnectTimeout),
		nats.PingInterval(2 * time.Second),
		nats.MaxPingsOutstanding(2),
		nats.Name(CONNECTION_NAME_NUI_PREFIX + connection.Name + "-discover"),
	}
	options = appendAuthOption(connection, options)
	options = appendTLSAuthOptions(connection, options)
	options = appendInboxPrefixOption(connection, options)
	return nats.Connect(strings.Join(connection.Hosts, ", "), options...)
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
