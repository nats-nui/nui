package connection

type Connection struct {
	Id            string         `json:"id" `
	Name          string         `json:"name" `
	Hosts         []string       `json:"hosts" `
	Subscriptions []Subscription `json:"subscriptions" `
	Auth          []Auth         `json:"auth" `
	CurrentAuth   Auth           `json:"current_auth" `
}

type Subscription struct {
	Subject string `json:"subject"`
}

const AuthModeNone = "auth_none"
const AuthModeToken = "auth_token"
const AuthModeUserPassword = "auth_user_password"
const AuthModeJwt = "auth_jwt"
const AuthModeCredsFile = "auth_creds_file"

const StatusConnected = "connected"
const StatusDisconnected = "disconnected"

type Auth struct {
	Mode     string `json:"mode"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
	Jwt      string `json:"jwt"`
	NKeySeed string `json:"n_key_seed" clover:"n_key_seed"`
	Creds    string `json:"creds"`
}

type ConnStatusChanged struct {
	Status string
	Err    error
}
