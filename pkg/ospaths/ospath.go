package ospaths

import "github.com/adrg/xdg"

const APPNAME = "nui-app"
const DBPATH = APPNAME + "/databases/nui"
const LOGSPATH = APPNAME + "/logs/logs.log"

func LogsPath() (string, error) {
	return xdg.DataFile(LOGSPATH)
}

func DbPath() (string, error) {
	return xdg.DataFile(DBPATH)
}
