package connection

import (
	"github.com/nats-io/nats.go"
	"strings"
	"time"
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
