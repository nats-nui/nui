import { SocketService } from ".";
import { SocketData } from "./types";


export class Commands {

	server: SocketService;

	constructor(server: SocketService) {
		this.server = server
	}

	table = {

		"ping": payload => this.server.ping.onMessage(),

		"connections:subscribe": payload => {
			this.server.send({
				cmm: "connections:subscribe",
				cnnId: "cnn1",
				sjbs: "topolino",
			})
		}
	}

	exe(data:SocketData) {
		const cmm = this.table[data.subject]
		if (!cmm) return
		cmm(data.payload);
	}
}
