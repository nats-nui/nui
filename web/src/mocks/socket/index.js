import { WebSocketServer } from "ws"
import { Thread } from "./thread.js"



let server = null
let client = null

serverStart()

function serverStart(port = 8080) {
	if (server) return
	server = new WebSocketServer({ port });
	console.log("server:start:" + port)

	server.on('connection', cws => {
		console.log("server:connection", cws.protocol, cws.url)
		client = cws
		// events
		client.on('message', onMessage)
		// startup
		//pingStart()
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

/** Gestisco il messaggio arrivato */
const onMessage = msg => {
	const data = JSON.parse(msg)

	console.log("FE > BE")
	console.log(data)

	if (data.connection_id && data.subjects) {
		const thread = Thread.Find({ cnnId: data.connection_id })
		if ( thread )  thread?.stop()
		if (Array.isArray(data.subjects) && data.subjects.length > 0) {
			new Thread(
				() => sendTestMessages(data.connection_id, data.subjects),
				{ cnnId: data.connection_id }
			).start()
		}
	}
}

function sendTestMessages(connectionId, subjects) {
	subjects.forEach(subject => send({
		subject,
		payload: `cnn:${connectionId} - ${"a".repeat(Math.round(Math.random()*200))}`,
	}))
}
//#endregion




export {
	send,
	serverStop
}
