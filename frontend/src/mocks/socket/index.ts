import { IncomingMessage as HttpIncomingMessage } from "http";
import url from "url";
import { WebSocket, WebSocketServer } from "ws";
import { generateMetrics } from "./metrics.js";
import { generateTestMessages } from "./testMessages.js";
import { Thread } from "./thread.js";
import { MSG_TYPE } from "@/plugins/SocketService/types.js";



let server: WebSocketServer | null = null;

serverStart();

function serverStart(port: number = 31311): void {
	if (server) return;
	server = new WebSocketServer({ port });

	console.log("server:start:" + port);

	server.on('connection', (cws: WebSocket, req: HttpIncomingMessage) => {
		const location = url.parse(req.url!, true);
		const { id: cnnId } = location.query;
		console.log("fe:connection:", cnnId);
		const client: Client = {
			cnnId: cnnId as string,
			cws,
		};
		cws.on('message', onMessage(client));
		cws.on('close', () => {
			Thread.Find({ cnnId })?.stop();
			console.log(`server:close:${client.cnnId}`);
		});
	});

	server.on("error", (error: Error) => {
		console.log("server:error:");
		console.log(error);
		console.log("---");
	});

	server.on("close", () => {
		console.log("server:close:" + port);
	});
}

function serverStop(): void {
	if (!server) return;
	server.close();
}


//#region COMMANDS

/** Gestisco il messaggio arrivato */
const onMessage = (client: Client) => (msgRaw: Buffer) => {
	const msg = JSON.parse(msgRaw.toString());

	console.log(client.cnnId, "FE > BE");
	console.log(msg);
	console.log("---");

	const type = msg.type;
	switch (type) {
		
		case MSG_TYPE.SUB_REQUEST:
			Thread.Find({ cnnId: client.cnnId })?.stop();
			const subjects = msg.payload.subjects;
			if (Array.isArray(subjects) && subjects.length > 0) {
				new Thread(
					() => send(client, generateTestMessages(subjects)),
					{ cnnId: client.cnnId }
				).start();
			}
			break;

		case MSG_TYPE.METRICS_REQ:
			Thread.Find({ cnnId: client.cnnId })?.stop();
			const enabled = msg.payload.enabled;
			if (!enabled) return;
			new Thread(
				() => send(client, generateMetrics()),
				{ cnnId: client.cnnId }
			).start();
			break;

		case MSG_TYPE.ERROR:
			break;
	}
};

/**
 * invio un messggio al client
 */
function send(client: Client, msg: any): void {
	console.log("BE > FE", msg.type);
	client.cws.send(JSON.stringify(msg));
}

//#endregion





// Type definitions
interface Client {
	cnnId: string;
	cws: WebSocket;
}
