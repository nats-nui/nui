package connection

import (
	"strconv"
	"strings"
)

// Redacted is the placeholder sent to clients in place of a stored secret.
// Connection secrets are redacted as "<Redacted>:<ref>", where ref points at the
// stored Auth the secret belongs to ("auth/<index>" or "metrics"), so that a
// client can send the placeholder back untouched and the stored value is kept,
// even if auth entries were reordered or deleted in the meantime.
const Redacted = "__nui_redacted__"

const redactedRefPrefix = Redacted + ":"
const metricsAuthRef = "metrics"

func authRef(index int) string {
	return "auth/" + strconv.Itoa(index)
}

// secretFields returns pointers to the fields of an Auth that must never be
// exposed to clients. Username (or public nkey) and the creds file path are not
// secrets and are left visible.
func (a *Auth) secretFields() map[string]*string {
	return map[string]*string{
		"password":   &a.Password,
		"token":      &a.Token,
		"jwt":        &a.Jwt,
		"n_key_seed": &a.NKeySeed,
	}
}

func (a *Auth) redact(ref string) {
	for _, f := range a.secretFields() {
		if *f != "" {
			*f = redactedRefPrefix + ref
		}
	}
}

// Redacted returns a copy of the connection with every secret replaced by a
// placeholder. The receiver is not modified.
func (c *Connection) Redacted() *Connection {
	if c == nil {
		return nil
	}
	out := *c
	if c.Auth != nil {
		out.Auth = make([]Auth, len(c.Auth))
		copy(out.Auth, c.Auth)
		for i := range out.Auth {
			out.Auth[i].redact(authRef(i))
		}
	}
	out.Metrics.NatsSource.Auth.redact(metricsAuthRef)
	return &out
}

// RestoreSecrets replaces every redaction placeholder in c with the secret it
// refers to in stored. Placeholders that cannot be resolved (no stored
// connection, unknown reference) are cleared, so a placeholder is never saved
// or used as a credential.
func (c *Connection) RestoreSecrets(stored *Connection) {
	for i := range c.Auth {
		c.Auth[i].restore(stored)
	}
	c.Metrics.NatsSource.Auth.restore(stored)
}

func (a *Auth) restore(stored *Connection) {
	for name, f := range a.secretFields() {
		if !strings.HasPrefix(*f, Redacted) {
			continue
		}
		ref := strings.TrimPrefix(*f, redactedRefPrefix)
		*f = ""
		if source := stored.resolveRef(ref, a); source != nil {
			*f = *source.secretFields()[name]
		}
	}
}

// resolveRef returns the stored Auth a placeholder refers to. The referenced
// entry must still have the same mode and username as the incoming one: a
// client holding a stale copy (entries since reordered or deleted elsewhere)
// would otherwise get another entry's secret. In that case the only stored
// entry with the same mode and username is used, if there is exactly one.
func (c *Connection) resolveRef(ref string, incoming *Auth) *Auth {
	if c == nil {
		return nil
	}
	sameIdentity := func(a *Auth) bool {
		return a.Mode == incoming.Mode && a.Username == incoming.Username
	}
	if ref == metricsAuthRef {
		if sameIdentity(&c.Metrics.NatsSource.Auth) {
			return &c.Metrics.NatsSource.Auth
		}
		return nil
	}
	if !strings.HasPrefix(ref, "auth/") {
		return nil
	}
	index, err := strconv.Atoi(strings.TrimPrefix(ref, "auth/"))
	if err == nil && index >= 0 && index < len(c.Auth) && sameIdentity(&c.Auth[index]) {
		return &c.Auth[index]
	}
	var match *Auth
	for i := range c.Auth {
		if sameIdentity(&c.Auth[i]) {
			if match != nil {
				return nil
			}
			match = &c.Auth[i]
		}
	}
	return match
}
