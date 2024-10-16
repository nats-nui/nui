package connection

import (
	"testing"

	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/stretchr/testify/assert"
)

func TestParseFromCliContext(t *testing.T) {
	tests := []struct {
		name      string
		inputName string
		input     clicontext.CliConnectionContext
		expected  Connection
	}{
		{
			name: "UserPassword",
			input: clicontext.CliConnectionContext{
				User:     "testuser",
				Password: "testpass",
			},
			expected: Connection{
				Name: "Test Connection",
				Auth: []Auth{
					{
						Mode:     AuthModeUserPassword,
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
			expected: Connection{
				Name: "Test Connection",
				Auth: []Auth{
					{
						Mode:  AuthModeToken,
						Token: "testtoken",
					},
				},
			},
		},
		{
			name: "JwtAuth",
			input: clicontext.CliConnectionContext{
				UserJWT: "testjwt",
			},
			expected: Connection{
				Name: "Test Connection",
				Auth: []Auth{
					{
						Mode: AuthModeJwt,
						Jwt:  "testjwt",
					},
				},
			},
		},
		{
			name: "NKeyAuth",
			input: clicontext.CliConnectionContext{
				NKey: "testnkey",
			},
			expected: Connection{
				Name: "Test Connection",
				Auth: []Auth{
					{
						Mode:     AuthModeNKey,
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
			expected: Connection{
				Name: "Test Connection",
				Auth: []Auth{
					{
						Mode:  AuthModeCredsFile,
						Creds: "testcreds",
					},
				},
			},
		},
		{
			name: "HostsFromURL",
			input: clicontext.CliConnectionContext{
				URL: "nats://localhost:4222,nats://remotehost:4222",
			},
			expected: Connection{
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
			expected: Connection{
				Name:        "Test Connection",
				Hosts:       []string{"nats://localhost:4222"},
				InboxPrefix: "inbox",
				TLSAuth: TLSAuth{
					Enabled:  true,
					CertPath: "path/to/cert",
					KeyPath:  "path/to/key",
					CaPath:   "path/to/ca",
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
