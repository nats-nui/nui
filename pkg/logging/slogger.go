package logging

type Slogger interface {
	Debug(msg string, args ...any)
	Info(msg string, args ...any)
	Warn(msg string, args ...any)
	Error(msg string, args ...any)
}

type MockedLogger struct{}

func (m *MockedLogger) Debug(msg string, args ...any) {}
func (m *MockedLogger) Info(msg string, args ...any)  {}
func (m *MockedLogger) Warn(msg string, args ...any)  {}
func (m *MockedLogger) Error(msg string, args ...any) {}
