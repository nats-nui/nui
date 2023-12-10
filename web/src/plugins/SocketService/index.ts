import { Reconnect } from "./reconnect.js";



export interface SocketOptions {
	protocol?: string
	host?: string
	port?: string
	base?: string
	onMessage?: (message: PayloadMessage) => void
}

export enum MSG_TYPE {
	/** SUBSCRIPTIONS REQUEST - client */
	SUB_REQUEST = "subscriptions_req",
	/** NATS MESSAGE - server */
	NATS_MESSAGE = "nats_msg",
	/** CONNECTION STATUS - server */
	CNN_STATUS = "connection_status",
	/** ERROR MESSAGE - client server */
	ERROR = "error",
}

export enum CNN_STATUS {
	CONNECTED = "connected",
	RECONNECTING = "reconnecting",
	DISCONNECTED = "disconnected",
}

export interface SocketMessage {
	type: MSG_TYPE
	payload: Payload
}

/** SUBSCRIPTIONS REQUEST - client */
export type PayloadSub = { 
	subjects: string[] 
}
/** NATS MESSAGE - server */
export type PayloadMessage = {
	subject: string
	payload: string
}
/** CONNECTION STATUS - server */
export type PayloadStaus = {
	status: CNN_STATUS
}
/** ERROR MESSAGE - client server */
export type PayloadError = {
	error: string
}

export type Payload = PayloadSub | PayloadMessage | PayloadStaus | PayloadError

const optionsDefault: SocketOptions = {
	protocol: window.location.protocol == "http:" ? "ws:" : "wss:",
	host: window.location.hostname,
	port: import.meta.env.VITE_API_WS_PORT ?? window.location.port,
	base: "",
}

export interface ISocket {
}

/**
 * Crea una connessione WS
 * gestisce le riconnessioni
 * gestisce il PING
 * gestisce la tabella dei COMMANDS
 */
export class SocketService {

	options: SocketOptions;
	websocket: WebSocket;
	cnnIdLast: string = null
	//ping: Ping;
	reconnect: Reconnect;
	//commands: Commands;

	onOpen: () => void = null;

	constructor(options: SocketOptions = {}) {
		this.options = { ...optionsDefault, ...options }
		this.websocket = null

		//this.ping = new Ping(this)
		this.reconnect = new Reconnect(this)
		//this.commands = new Commands(this)
	}

	/** 
	 * tenta di aprire il socket
	 */
	connect(connId: string = this.cnnIdLast) {
		if (this.websocket) return
		this.cnnIdLast = connId
		const { protocol, host, port, base } = this.options
console.log( "connect",connId)
		this.reconnect.enabled = true
		try {
			let url = `${protocol}//${host}:${port}/ws/sub`
			if (base) url = `${url}/${base}`
			if (connId) url = `${url}?id=${connId}`
			this.websocket = new WebSocket(url);
		} catch (error) {
			this.reconnect.start()
			console.error(error)
			return
		}

		this.websocket.onopen = this.onopen.bind(this);
		this.websocket.onclose = this.onClose.bind(this);
		this.websocket.onmessage = this.onMessage.bind(this);
		this.websocket.onerror = this.onError.bind(this);
	}

	/** 
	 * chiude il socket
	 */
	clear(newToken: string = null) {
		if (!this.websocket) return
		this.websocket.close()
		this.websocket = null
		if (newToken) this.cnnIdLast = newToken
	}

	/** 
	 * chiude il socket e mantiene chiuso (usato nel logout)
	 */
	disconnect() {
console.log("disconnect")		
		this.cnnIdLast = null
		this.reconnect.enabled = false
		this.reconnect.stop()
		this.clear()
	}

	/** 
	 * invia un messaggio al server
	 */
	send(json: any) {
		const data = JSON.stringify(json)
		console.debug("FE > BE", data)
		this.websocket.send(data)
	}

	sendSubjects(subjects: string[]) {
		const msg:SocketMessage = {
			type: MSG_TYPE.SUB_REQUEST,
			payload: { subjects },
		}
		this.send(msg)
	}

	//#region SOCKET EVENT

	onopen(_: Event) {
		console.log("socket:open")
		this.reconnect.stop()
		this.reconnect.tryZero()
		//this.ping.start()
		this.onOpen?.()
	}

	onClose(_: CloseEvent) {
		console.log("socket:close")
		//this.ping.stop()
		this.clear()
		this.reconnect.start()
	}

	/** ricevo un messaggio dal BE */
	onMessage(e: MessageEvent) {
		const message: SocketMessage = JSON.parse(e.data) as SocketMessage
		const type = message.type
		switch (type) {
			case MSG_TYPE.CNN_STATUS:
				break
			case MSG_TYPE.NATS_MESSAGE:
				if (!this.options.onMessage) return
				const payload = message.payload as PayloadMessage
				this.options.onMessage({
					subject: payload.subject,
					payload: atob(payload.payload),
				})
				break
			case MSG_TYPE.ERROR:
				break
		}
	}

	onError(_: Event) {
		//console.log("socket:error:", e)
	}

	//#endregion
}


