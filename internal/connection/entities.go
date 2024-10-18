package connection

type Connection struct {
	Id            string            `json:"id" `
	Name          string            `json:"name" `
	Hosts         []string          `json:"hosts" `
	InboxPrefix   string            `json:"inbox_prefix"`
	Subscriptions []Subscription    `clover:"subscriptions" json:"subscriptions"`
	Auth          []Auth            `json:"auth" `
	TLSAuth       TLSAuth           `clover:"tls_auth" json:"tls_auth" `
	Metadata      map[string]string `json:"metadata" `
}

func (c *Connection) GetMetadata(key string) (string, bool) {
	if c.Metadata == nil {
		return "", false
	}
	return c.Metadata[key], true
}

func (c *Connection) SetMetadata(key, value string) {
	if c.Metadata == nil {
		c.Metadata = make(map[string]string)
	}
	c.Metadata[key] = value
}

type Subscription struct {
	Subject string `json:"subject"`
}

type Auth struct {
	Active   bool   `json:"active"`
	Mode     string `json:"mode"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
	Jwt      string `json:"jwt"`
	NKeySeed string `json:"n_key_seed" clover:"n_key_seed"`
	Creds    string `json:"creds"`
}

const AuthModeNone = "auth_none"
const AuthModeToken = "auth_token"
const AuthModeUserPassword = "auth_user_password"
const AuthModeNKey = "auth_nkey"
const AuthModeJwt = "auth_jwt"
const AuthModeJwtBearer = "auth_jwt_bearer"
const AuthModeCredsFile = "auth_creds_file"

type TLSAuth struct {
	Enabled  bool   `clover:"enabled" json:"enabled"`
	CertPath string `clover:"cert_path" json:"cert_path"`
	KeyPath  string `clover:"key_path" json:"key_path"`
	CaPath   string `clover:"ca_path" json:"ca_path"`
}

type ConnStatusChanged struct {
	Status string
	Err    error
}

const StatusConnected = "connected"
const StatusDisconnected = "disconnected"
