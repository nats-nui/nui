package nui

type Error struct {
	Error string `json:"error"`
}

func NewError(err string) *Error {
	return &Error{Error: err}
}
