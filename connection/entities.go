package connection

type Connection struct {
	Id            string         `json:"id"`
	Name          string         `json:"name"`
	Hosts         []string       `json:"hosts"`
	Subscriptions []Subscription `json:"subscriptions"`
}

type Subscription struct {
	Subject string `json:"subject"`
}

type ConnStatusChanged struct {
	Status string
	Err    error
}
