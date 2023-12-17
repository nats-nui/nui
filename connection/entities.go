package connection

type Connection struct {
	Id            string         `json:"id" clover:"id"`
	Name          string         `json:"name" clover:"name"`
	Hosts         []string       `json:"hosts" clover:"hosts"`
	Subscriptions []Subscription `json:"subscriptions" clover:"subscriptions"`
	Auth          Auth           `json:"Auth" clover:"Auth"`
	Auth2         []Auth         `json:"auth2" clover:"auth2"`
}

type Subscription struct {
	Subject string `json:"subject"`
}

const AuthModeNone = "auth_none"
const AuthModeToken = "auth_token"
const AuthModeUserPassword = "auth_user_password"
const AuthModeJwt = "auth_jwt"
const AuthModeCredsFile = "auth_creds_file"

type Auth struct {
	Mode          string `json:"Mode" clover:"Mode"`
	Username      string `json:"username" clover:"username"`
	Password      string `json:"password" clover:"password"`
	Token         string `json:"token" clover:"token"`
	Jwt           string `json:"jwt" clover:"jwt"`
	NKeySeed      string `json:"nkey" clover:"nkey"`
	CredsFilePath string `json:"creds" clover:"creds"`
}

type ConnStatusChanged struct {
	Status string
	Err    error
}
