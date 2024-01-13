import { WebSocketServer } from "ws"
import { Thread } from "./thread.js"
import url from "url"
import jsonData from "./jsonData.js"



let server = null

serverStart()

function serverStart(port = 3111) {
	if (server) return
	server = new WebSocketServer({ port });

	console.log("server:start:" + port)

	server.on('connection', (cws, req) => {
		const location = url.parse(req.url, true);
		const { id: cnnId } = location.query
		console.log("fe:connection:", cnnId);
		const client = { cnnId, cws }
		cws.on('message', onMessage(client))
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

function serverStop() {
	if (!server) return
	server.close()
}



//#region COMMANDS

/** Gestisco il messaggio arrivato */
const onMessage = client => msgRaw => {
	const msg = JSON.parse(msgRaw)

	console.log(client.cnnId, "FE > BE")
	console.log(msg)
	console.log("---")

	const type = msg.type
	switch (type) {
		case "subscriptions_req":
			client.thread?.stop()
			const subjects = msg.payload.subjects
			if (Array.isArray(subjects) && subjects.length > 0) {
				client.thread = new Thread(() => {
					sendTestMessages(client, subjects)
				}).start()
			}
			break
		case "error":
			break
	}
}

function send(cws, msg) {
	msg.payload.payload = Buffer.from(msg.payload.payload, "utf8").toString("base64")
	cws.send(JSON.stringify(msg))
}



let messagesSend = 0

function sendTestMessages(client, subjects) {
	subjects.forEach(subject => {
		send(client.cws, {
			type: "nats_msg",
			payload: {
				subject,
				payload: getJsonData(messagesSend)
			},
		})
		messagesSend++
	})
}

function getJsonData(index) {
	return JSON.stringify(jsonData[index % jsonData.length])
}

//#endregion




export {
	send,
	serverStop
}
