package ospaths

import "github.com/adrg/xdg"

const APPNAME = "nui-app"
const DBPATH = APPNAME + "/databases/nui"
const PROTOSCHEMASPATH = APPNAME + "/protoschemas/default"
const CDDLSCHEMASPATH = APPNAME + "/cddlschemas/default"
const LOGSPATH = APPNAME + "/logs/logs.log"

func LogsPath() (string, error) {
	return xdg.DataFile(LOGSPATH)
}

func DbPath() (string, error) {
	return xdg.DataFile(DBPATH)
}

func ProtoSchemasPath() (string, error) {
	return xdg.DataFile(PROTOSCHEMASPATH)
}

func CddlSchemasPath() (string, error) {
	return xdg.DataFile(CDDLSCHEMASPATH)
}
