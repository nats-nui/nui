import jsonData from "./jsonData.js"

let messagesSend = 0
/** messaggi dopo i quali deve simulare una disconnessione */
const numMsg = 50000000

function getJsonData(index) {
	return JSON.stringify(jsonData[index % jsonData.length])
}

export function generateTestMessages(subjects) {
	const subject = subjects[messagesSend % subjects.length]
	let msg = null

	// è connesso e quindi manda il messaggio
	if (messagesSend < numMsg) {
		const json = getJsonData(messagesSend)
		const payload = Buffer.from(json, "utf8").toString("base64")
		msg = {
			type: "nats_msg",
			payload: {
				headers: {
					"key1": ["value1"],
					"key2": [],
					"key3": ["value1", "value2", "value3 dldsfòlfd dsfòfd fjfgs bfdg dlghs df sgshdsfs gljfsdh gldfg sfdjglsdfgh sdlfgh sdfljgh sdflgj sldfhg dfljgh sdlgh lsdfhgl sdh glsdh g "],
				},
				subject,
				payload,
			},
		}
		// manda il messaggio di disconnessione
	} else if (messagesSend == numMsg) {
		msg = {
			type: "connection_status",
			payload: {
				status: "diconnected"
			},
		}
		// manda il messaggio che si sta riconnettendo
	} else if (messagesSend == numMsg + 2) {
		msg = {
			type: "connection_status",
			payload: {
				status: "reconnecting"
			},
		}
		// manda il messaggio che s'e' riconnesso
	} else if (messagesSend == numMsg + 5) {
		msg = {
			type: "connection_status",
			payload: {
				status: "connected"
			},
		}
		messagesSend = 0
	}
	messagesSend++
	return msg
}
