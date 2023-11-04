
let idPing = null
let timePing = 2000
let pingEnabled = true

const pingStart = () => {
	if (idPing || pingEnabled == false) return;
	idPing = setInterval(() => {
		if (!client) return
		pingSend()
	}, timePing)
}
const pingStop = () => {
	if (!idPing || pingEnabled == true) return
	clearInterval(idPing)
	idPing = null
}
const pingSend = () => {
	const data = {
		subject: "ping",
		activity: "ping at 2020-09-17 17:01:58.416460684 +0300 EEST m=+540.070420680"
	}
	client.send(JSON.stringify(data))
}
const pingSetEnabled = (enable) => {
	pingEnabled = enable
	if (pingEnabled) {
		pingStart()
	} else {
		pingStop()
	}
}

//#endregion


export {
	pingSetEnabled,
}
