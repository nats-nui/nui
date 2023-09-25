import { pingSetEnabled, send, serverStop } from "./index.js"



const wait = (millisec) => new Promise((res, rej) => setTimeout(res, millisec))

const commands = {

	// DEBUG
	"ping:stop": _ => pingSetEnabled(false),

	// DEBUG
	"ping:start": _ => pingSetEnabled(true),

	"connection:close": _ => serverStop(),

	"message:send": _ => {
		send({
			topic: "test",
			payload: "p_test"
		})
	},

	// "antenna:status": async _ => {
	// 	await wait(1000)
	// 	send({
	// 		subject: "rulesengine.event.antennasystem.status",
	// 		activity: getAntennaStatus(),
	// 	})
	// },

	// "ship:status": async _ => {
	// 	await wait(1000)
	// 	send({
	// 		subject: "rulesengine.event.ship.status",
	// 		activity: getShipStatus(),
	// 	})
	// },

	// "graph:status": async _ => {
	// 	//await wait(100)
	// 	send({
	// 		subject: "measure_response",
	// 		activity: {
	// 			ship: {
	// 				heading: generate(),
	// 			},
	// 			antennas: [
	// 				{
	// 					antenna_number: 1,
	// 					relative_azimuth: generate(),
	// 					relative_elevation: generate(),
	// 					signal: generate(),
	// 					feedback_azimuth: generate(),
	// 					feedback_elevation: generate(),
	// 				},
	// 				{
	// 					antenna_number: 2,
	// 					relative_azimuth: generate(),
	// 					relative_elevation: generate(),
	// 					signal: generate(),
	// 					feedback_azimuth: generate(),
	// 					feedback_elevation: generate(),
	// 				}
	// 			]
	// 		}
	// 	})
	// },

	// "diagnostics:status": async _ => {
	// 	//await wait(100)
	// 	send({
	// 		"subject": "diagnostics.event.subsystems.status",
	// 		"activity": {
	// 			"subsystems": diagnostic,
	// 		}
	// 	})
	// },
	
	// "dashboard:status": async _ => {
	// 	//await wait(100)
	// 	send(dashboard)
	// },

}

export default commands


