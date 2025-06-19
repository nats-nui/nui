import { WebSocketServer } from "ws"
import { Thread } from "./thread.js"
import url from "url"
import { sendTestMessages as generateTestMessages } from "./testMessages.js"
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
					() => send(client, generateTestMessages(subjects)),
					{ cnnId: client.cnnId }
				).start()
			}
			break

		case "metrics_req":
			Thread.Find({ cnnId: client.cnnId })?.stop()
			const enabled = msg.payload.enabled
			if (!enabled) return
			new Thread(
				() => sendMetrics(client),
				{ cnnId: client.cnnId }
			).start()

		case "error":
			break
	}
}

/**
 * invio un messggio any al client
 */
function send(cws, msg) {
	console.log("BE > FE", msg.type)
	cws.send(JSON.stringify(msg))
}

function sendMetrics(client) {
	const now = new Date().toISOString()
	const numConnections = 1

	// Generate single random connection
	const connectionTypes = ["nats", "mqtt", "ws"]
	const connectionType = connectionTypes[randomInt(0, connectionTypes.length)]
	const cid = randomInt(1, 1000)
	const port = randomInt(60000, 65535)
	const startTime = new Date(Date.now() - randomInt(1000, 86400000)).toISOString()
	const lastActivity = new Date(Date.now() - randomInt(0, 3600000)).toISOString()
	const uptime = randomInt(1, 86400) + "s"
	const idle = randomInt(0, 3600) + "s"
	const rtt = randomInt(50, 500) + "µs"

	const connection = {
		cid: cid,
		kind: "Client",
		type: connectionType,
		ip: "127.0.0.1",
		port: port,
		start: startTime,
		last_activity: lastActivity,
		rtt: rtt,
		uptime: uptime,
		idle: idle,
		pending_bytes: randomInt(0, 1024),
		in_msgs: randomInt(0, 10000),
		out_msgs: randomInt(0, 10000),
		in_bytes: randomInt(0, 1048576),
		out_bytes: randomInt(0, 1048576),
		subscriptions: randomInt(0, 10)
	}

	if (connectionType === "nats") {
		const languages = ["go", "js", "python", "java", "rust"]
		const versions = ["1.12.1", "2.3.4", "1.8.0", "2.1.0", "1.15.2"]
		connection.name = "NATS Client " + randomInt(1, 100)
		connection.lang = languages[randomInt(0, languages.length)]
		connection.version = versions[randomInt(0, versions.length)]
	} else if (connectionType === "mqtt") {
		const mqttClients = ["mqtt_sub", "mqtt_pub", "mqtt_client", "paho_client"]
		connection.mqtt_client = mqttClients[randomInt(0, mqttClients.length)]
	}

	const metricsData = {
		server_id: "NACDVKFBUW4C4XA24OOT6L4MDP56MW76J5RJDFXG7HLABSB46DCMWCOW",
		now: now,
		num_connections: numConnections,
		total: numConnections,
		offset: 0,
		limit: 1024,
		connections: [connection]
	}

	send(client.cws, {
		type: "metrics_resp",
		payload: {
			nats: metricsData
		}
	})
}

//#endregion
