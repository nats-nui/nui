package clicontext

import (
	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/stretchr/testify/assert"
	"os"
	"testing"
)

func TestCliContext(t *testing.T) {
	l := &logging.NullLogger{}
	dir, _ := os.Getwd()
	importer := clicontext.NewImporter(l)
	entries, err := importer.Import(dir)
	assert.NoError(t, err)
	assert.Equal(t, 3, len(entries))
	assert.NoError(t, entries[0].Error)
	assert.NoError(t, entries[1].Error)
	assert.Error(t, entries[2].Error)

	expected := clicontext.CliConnectionContext{
		Description:          "context 1",
		URL:                  "nats://demo.nats.io:4222",
		SocksProxy:           "",
		Token:                "token",
		User:                 "user1",
		Password:             "pass1",
		Creds:                "/path/to/creds",
		NKey:                 "SKEYSEED",
		Cert:                 "/path/to/cert",
		Key:                  "/path/to/key",
		CA:                   "/path/to/ca",
		NSC:                  "",
		JetStreamDomain:      "",
		JetStreamAPIPrefix:   "",
		JetStreamEventPrefix: "",
		InboxPrefix:          "custom_inbox",
		UserJWT:              "bearer_jwt",
		ColorScheme:          "",
		TLSFirst:             false,
	}
	assert.Equal(t, "ctx1", entries[0].Name)
	assert.Equal(t, expected, entries[0].ImportedContext)

}
