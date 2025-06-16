import { WebSocketServer } from "ws"
import { Thread } from "./thread.js"
import url from "url"
import { sendTestMessages } from "./testMessages.js"
import { randomInt } from "crypto"



let server = null

serverStart()

function serverStart(port = 31311) {
	if (server) return
	server = new WebSocketServer({ port });

	console.log("server:start:" + port)

	server.on('connection', (cws, req) => {
		const location = url.parse(req.url, true);
		const { id: cnnId } = location.query
		console.log("fe:connection:", cnnId);
		const client = {
			cnnId,
			cws,
		}
		cws.on('message', onMessage(client))
		cws.on('close', () => {
			Thread.Find({ cnnId })?.stop()
			console.log(`server:close:${client.cnnId}`);
		});
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
			Thread.Find({ cnnId: client.cnnId })?.stop()
			const subjects = msg.payload.subjects
			if (Array.isArray(subjects) && subjects.length > 0) {
				new Thread(
					() => sendTestMessages(client, subjects),
					{ cnnId: client.cnnId }
				).start()
			}
			break

		case "metrics_req":
			Thread.Find({ cnnId: client.cnnId })?.stop()
			const enabled = msg.payload.enabled
			if (!enabled) return
			new Thread(
				() => send(client.cws, {
					type: "metrics_resp",
					payload: {
						nats: {
							test: randomInt(1000, 9999),
						}
					}
				}),
				{ cnnId: client.cnnId }
			).start()

		case "error":
			break
	}
}


function send(cws, msg) {
	console.log("BE > FE", msg.type)
	cws.send(JSON.stringify(msg))
}

//#endregion
