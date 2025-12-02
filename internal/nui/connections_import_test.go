package nui

import (
	"github.com/nats-nui/nui/internal/connection"
	"github.com/stretchr/testify/assert"
	"testing"

	"github.com/nats-nui/nui/pkg/clicontext"
)

func TestParseFromCliContext(t *testing.T) {
	tests := []struct {
		name      string
		inputName string
		input     clicontext.CliConnectionContext
		expected  connection.Connection
	}{
		{
			name: "UserPassword",
			input: clicontext.CliConnectionContext{
				User:     "testuser",
				Password: "testpass",
			},
			expected: connection.Connection{
				Name: "Test Connection",
				Auth: []connection.Auth{
					{
						Mode:     connection.AuthModeUserPassword,
						Active:   true,
						Username: "testuser",
						Password: "testpass",
					},
				},
			},
		},
		{
			name: "Token",
			input: clicontext.CliConnectionContext{
				Token: "testtoken",
			},
			expected: connection.Connection{
				Name: "Test Connection",
				Auth: []connection.Auth{
					{
						Active: true,
						Mode:   connection.AuthModeToken,
						Token:  "testtoken",
					},
				},
			},
		},
		{
			name: "JwtAuth",
			input: clicontext.CliConnectionContext{
				UserJWT: "testjwt",
			},
			expected: connection.Connection{
				Name: "Test Connection",
				Auth: []connection.Auth{
					{
						Active: true,
						Mode:   connection.AuthModeJwt,
						Jwt:    "testjwt",
					},
				},
			},
		},
		{
			name: "NKeyAuth",
			input: clicontext.CliConnectionContext{
				NKey: "testnkey",
			},
			expected: connection.Connection{
				Name: "Test Connection",
				Auth: []connection.Auth{
					{
						Active:   true,
						Mode:     connection.AuthModeNKey,
						NKeySeed: "testnkey",
					},
				},
			},
		},
		{
			name: "CredsFileAuth",
			input: clicontext.CliConnectionContext{
				Creds: "testcreds",
			},
			expected: connection.Connection{
				Name: "Test Connection",
				Auth: []connection.Auth{
					{
						Active: true,
						Mode:   connection.AuthModeCredsFile,
						Creds:  "testcreds",
					},
				},
			},
		},
		{
			name: "multiple auths",
			input: clicontext.CliConnectionContext{
				User:     "user",
				Password: "pass",
				Creds:    "testcreds",
			},
			expected: connection.Connection{
				Name: "Test Connection",
				Auth: []connection.Auth{
					{
						Active:   true,
						Mode:     connection.AuthModeUserPassword,
						Username: "user",
						Password: "pass",
					},
					{
						Active: false,
						Mode:   connection.AuthModeCredsFile,
						Creds:  "testcreds",
					},
				},
			},
		},
		{
			name: "HostsFromURL",
			input: clicontext.CliConnectionContext{
				URL: "nats://localhost:4222,nats://remotehost:4222",
			},
			expected: connection.Connection{
				Name:  "Test Connection",
				Hosts: []string{"nats://localhost:4222", "nats://remotehost:4222"},
			},
		},
		{
			name: "Test Connection",
			input: clicontext.CliConnectionContext{
				Description:          "Complete Connection",
				URL:                  "nats://localhost:4222",
				InboxPrefix:          "inbox",
				Cert:                 "path/to/cert",
				Key:                  "path/to/key",
				CA:                   "path/to/ca",
				JetStreamDomain:      "domain",
				JetStreamAPIPrefix:   "api_prefix",
				JetStreamEventPrefix: "event_prefix",
				TLSFirst:             true,
			},
			expected: connection.Connection{
				Name:        "Test Connection",
				Hosts:       []string{"nats://localhost:4222"},
				InboxPrefix: "inbox",
				TLSAuth: connection.TLSAuth{
					Enabled:        true,
					CertPath:       "path/to/cert",
					KeyPath:        "path/to/key",
					CaPath:         "path/to/ca",
					HandshakeFirst: true,
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parseFromCliContext("Test Connection", tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
