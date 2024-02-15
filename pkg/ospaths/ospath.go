package ospaths

type Paths struct {
	LogsPath string
	DbPath   string
}

func Defaults() Paths {
	return Paths{
		LogsPath: "./logs",
		DbPath:   "./db",
	}
}
