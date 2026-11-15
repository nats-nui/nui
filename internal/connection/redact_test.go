package connection

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func storedConn() *Connection {
	c := &Connection{
		Id: "c1",
		Auth: []Auth{
			{Mode: AuthModeUserPassword, Username: "alice", Password: "alice-pass"},
			{Mode: AuthModeUserPassword, Username: "bob", Password: "bob-pass"},
			{Mode: AuthModeNKey, Username: "UPUBLIC", NKeySeed: "SUSEED"},
			{Mode: AuthModeJwt, Jwt: "user-jwt", NKeySeed: "SUJWTSEED"},
			{Mode: AuthModeToken, Token: "s3cr3t-token"},
			{Mode: AuthModeCredsFile, Creds: "/path/to/user.creds"},
		},
	}
	c.Metrics.NatsSource.Auth = Auth{Mode: AuthModeUserPassword, Username: "sys", Password: "sys-pass"}
	return c
}

func TestRedactedHidesEverySecret(t *testing.T) {
	stored := storedConn()
	redacted := stored.Redacted()

	raw, err := json.Marshal(redacted)
	require.NoError(t, err)
	for _, secret := range []string{"alice-pass", "bob-pass", "SUSEED", "user-jwt", "SUJWTSEED", "s3cr3t-token", "sys-pass"} {
		assert.NotContains(t, string(raw), secret)
	}

	// non secret fields stay visible
	assert.Equal(t, "alice", redacted.Auth[0].Username)
	assert.Equal(t, "UPUBLIC", redacted.Auth[2].Username)
	assert.Equal(t, "/path/to/user.creds", redacted.Auth[5].Creds)
	// empty secrets stay empty, so clients can tell a secret is set
	assert.Equal(t, "", redacted.Auth[0].Token)

	// the stored connection is not modified
	assert.Equal(t, storedConn(), stored)
}

func TestRestoreSecretsRoundTrip(t *testing.T) {
	stored := storedConn()
	incoming := stored.Redacted()
	incoming.RestoreSecrets(stored)
	assert.Equal(t, storedConn(), incoming)
}

func TestRestoreSecretsFollowsEntriesAfterDeleteAndReorder(t *testing.T) {
	stored := storedConn()
	redacted := stored.Redacted()

	// client deletes alice and moves the token entry first
	incoming := redacted.Redacted()
	incoming.Auth = []Auth{redacted.Auth[4], redacted.Auth[1], redacted.Auth[2]}
	incoming.RestoreSecrets(stored)

	assert.Equal(t, "s3cr3t-token", incoming.Auth[0].Token)
	assert.Equal(t, "bob-pass", incoming.Auth[1].Password)
	assert.Equal(t, "SUSEED", incoming.Auth[2].NKeySeed)
}

func TestRestoreSecretsKeepsNewValues(t *testing.T) {
	stored := storedConn()
	incoming := stored.Redacted()
	incoming.Auth[0].Password = "new-pass"
	incoming.Metrics.NatsSource.Auth.Password = "new-sys-pass"
	incoming.RestoreSecrets(stored)

	assert.Equal(t, "new-pass", incoming.Auth[0].Password)
	assert.Equal(t, "new-sys-pass", incoming.Metrics.NatsSource.Auth.Password)
	assert.Equal(t, "bob-pass", incoming.Auth[1].Password)
}

func TestRestoreSecretsWithStaleCopy(t *testing.T) {
	stored := storedConn()
	stale := stored.Redacted()

	// meanwhile alice was deleted from another tab: every stored entry shifted
	stored.Auth = stored.Auth[1:]

	stale.RestoreSecrets(stored)
	// alice is gone, her placeholder must not resolve to bob (now at auth/0)
	assert.Equal(t, "", stale.Auth[0].Password)
	// the others are found by mode and username
	assert.Equal(t, "bob-pass", stale.Auth[1].Password)
	assert.Equal(t, "SUSEED", stale.Auth[2].NKeySeed)
	assert.Equal(t, "user-jwt", stale.Auth[3].Jwt)
	assert.Equal(t, "SUJWTSEED", stale.Auth[3].NKeySeed)
	assert.Equal(t, "s3cr3t-token", stale.Auth[4].Token)
}

func TestRestoreSecretsClearsAmbiguousMatches(t *testing.T) {
	stored := &Connection{Auth: []Auth{
		{Mode: AuthModeToken, Token: "token-a"},
		{Mode: AuthModeToken, Token: "token-b"},
	}}
	incoming := &Connection{Auth: []Auth{{Mode: AuthModeToken, Token: Redacted + ":auth/5"}}}
	incoming.RestoreSecrets(stored)
	assert.Equal(t, "", incoming.Auth[0].Token)
}

func TestRestoreSecretsClearsUnresolvablePlaceholders(t *testing.T) {
	newIncoming := func() *Connection {
		c := &Connection{Auth: []Auth{
			{Mode: AuthModeToken, Token: Redacted},
			{Mode: AuthModeToken, Token: Redacted + ":garbage"},
			{Mode: AuthModeUserPassword, Username: "mallory", Password: Redacted + ":auth/0"},
		}}
		c.Metrics.NatsSource.Auth = Auth{Mode: AuthModeUserPassword, Username: "sys", Password: Redacted + ":metrics"}
		return c
	}

	// no stored connection (create)
	c := newIncoming()
	c.RestoreSecrets(nil)
	assert.Equal(t, "", c.Auth[0].Token)
	assert.Equal(t, "", c.Auth[1].Token)
	assert.Equal(t, "", c.Auth[2].Password)
	assert.Equal(t, "", c.Metrics.NatsSource.Auth.Password)

	// malformed references, or a username that does not match the stored entry
	c = newIncoming()
	c.RestoreSecrets(storedConn())
	assert.Equal(t, "", c.Auth[0].Token)
	assert.Equal(t, "", c.Auth[1].Token)
	assert.Equal(t, "", c.Auth[2].Password)
	assert.Equal(t, "sys-pass", c.Metrics.NatsSource.Auth.Password)

	// metrics auth with a different user does not get the stored password
	c = newIncoming()
	c.Metrics.NatsSource.Auth.Username = "other"
	c.RestoreSecrets(storedConn())
	assert.Equal(t, "", c.Metrics.NatsSource.Auth.Password)
}
