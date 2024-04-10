package version

var version string

func Set(v string) {
	version = v
}

func Get() string {
	return version
}
