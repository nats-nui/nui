import commands from "./commands.js"
import WebSocket, { WebSocketServer } from "ws"



let server = null
let client = null

serverStart()

function serverStart(port = 8080) {
	if (server) return
	server = new WebSocketServer({ port });
	console.log("server:start:" + port)

	server.on('connection', cws => {
		console.log("server:connection")
		client = cws
		// events
		client.on('message', onMessage)
		// startup
		pingStart()
	})

	server.on("error", (error) => {
		console.log("server:error:")
		console.log(error)
		console.log("---")
	})

	server.on("close", () => {
		console.log("server:close:" + port)
	})
}

function send(data) {
	client.send(JSON.stringify(data))
}

function serverStop() {
	if (!server) return
	server.close()
}



//#region COMMANDS

// {
// 	type: "mock",
// 	cmm: "antenna:position",
// 	data: data
// }
const onMessage = msg => {
	console.log("client:message:")
	console.log(msg)
	console.log("---")
	const data = JSON.parse(msg)
	typeCmm[data.type](data)
}

const typeCmm = {
	"mock": data => commands[data.cmm](data)
}

//#endregion



//#region  PING

let idPing = null
let timePing = 2000
let pingEnabled = true

const pingStart = () => {
	if (idPing || pingEnabled==false) return;
	idPing = setInterval(() => {
		if (!client) return
		pingSend()
	}, timePing)
}
const pingStop = () => {
	if (!idPing || pingEnabled==true) return
	clearInterval(idPing)
	idPing=null
}
const pingSend = () => {
	const data = {
		subject: "ping",
		activity: "ping at 2020-09-17 17:01:58.416460684 +0300 EEST m=+540.070420680"
	}
	client.send(JSON.stringify(data))
}
const pingSetEnabled = ( enable ) => {
	pingEnabled = enable
	if ( pingEnabled ) {
		pingStart()
	} else {
		pingStop()
	}
}

//#endregion


export {
	send,
	pingSetEnabled,
	serverStop,
}