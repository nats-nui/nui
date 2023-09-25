import { SocketService } from ".";
import { SocketData } from "./types";


export class Commands {

	server: SocketService;

	constructor(server: SocketService) {
		this.server = server
	}

	table = {

		"ping": payload => this.server.ping.onMessage(),

		// "rulesengine.event.antennasystem.status": activity => {
		// 	setAntenna(activity.antennas[0])
		// 	setAntenna(activity.antennas[1])
		// 	setSlu(activity.slu)
		// 	setAntennaSys(activity)
		// 	setBucs(activity.bucs)
		// },

		// "rulesengine.event.ship.status": activity => {
		// 	setShip(activity.ship_params)
		// },

		// "diagnostics.event.subsystems.status": activity => {
		// 	setDiagnostic(activity.subsystems)
		// },

		// "rulesengine.event.antennasystem.currentconnections": activity => {
		// 	setCurrentConnection(activity)
		// },


		// "measure_response": activity => {
		// 	setChart(activity)
		// }

	}

	exe(data:SocketData) {
		const cmm = this.table[data.subject]
		if (!cmm) return
		cmm(data.payload);
	}
}
