import { Reconnect } from "./reconnect.js";
import { MSG_TYPE, PayloadMessage, SocketMessage, SocketOptions } from "./types.js";



const optionsDefault: SocketOptions = {
	protocol: window.location.protocol == "http:" ? "ws:" : "wss:",
	host: window.location.hostname,
	port: import.meta.env.VITE_API_WS_PORT ?? window.location.port,
	base: "",
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
	// l'ultimo id connection utilizzato per la connessione WS
	cnnId: string = null
	// modulo per la riconnessione
	reconnect: Reconnect;

	// callback su apertura connessione
	onOpen: () => void = null
	// callback su arrivo messaggio
	onMessage?: (message: PayloadMessage) => void

	constructor(options: SocketOptions = {}) {
		this.options = { ...optionsDefault, ...options }
		this.websocket = null
		this.reconnect = new Reconnect(this)
	}

	/** 
	 * tenta di aprire il socket
	 */
	connect(connId: string = this.cnnId) {
		if (this.websocket) return
		this.cnnId = connId
		const { protocol, host, port, base } = this.options
		this.reconnect.enabled = true
		try {
			let url = `${protocol}//${host}:${port}/ws/sub`
			if (base) url = `${url}/${base}`
			if (connId) url = `${url}?id=${connId}`
			console.debug("socket:try_connecting:", url)
			this.websocket = new WebSocket(url);
		} catch (error) {
			this.reconnect.start()
			console.error(error)
			return
		}

		this.websocket.onopen = this.handleOpen.bind(this);
		this.websocket.onclose = this.handleClose.bind(this);
		this.websocket.onmessage = this.handleMessage.bind(this);
		this.websocket.onerror = this.handleError.bind(this);
	}

	/** 
	 * libera tutte le risorse
	 */
	clear(newCnnId: string = null) {
		if (!this.websocket) return
		this.websocket.close()
		this.websocket = null
		if (newCnnId) this.cnnId = newCnnId
	}

	/** 
	 * chiude il socket e mantiene chiuso (usato nel logout)
	 */
	disconnect() {
		console.debug("socket:disconnect")		
		this.cnnId = null
		this.reconnect.enabled = false
		this.reconnect.stop()
		this.clear()
	}

	/** 
	 * invia un messaggio al server
	 */
	send(msg: string) {
		console.debug("socket:FE>BE:", msg)
		this.websocket.send(msg)
	}

	sendSubjects(subjects: string[]) {
		console.debug("socket:sendSubjects:", subjects)
		const msg: SocketMessage = {
			type: MSG_TYPE.SUB_REQUEST,
			payload: { subjects },
		}
		const msgStr = JSON.stringify(msg)
		this.send(msgStr)
	}

	//#region SOCKET EVENT

	handleOpen(_: Event) {
		//console.log("socket:open")
		this.reconnect.stop()
		this.reconnect.tryZero()
		this.onOpen?.()
	}

	handleClose(_: CloseEvent) {
		//console.log("socket:close")
		this.clear()
		this.reconnect.start()
	}

	/** ricevo un messaggio dal BE */
	handleMessage(e: MessageEvent) {
		const message: SocketMessage = JSON.parse(e.data) as SocketMessage
		const type = message.type
		switch (type) {
			case MSG_TYPE.CNN_STATUS:
				break
			case MSG_TYPE.NATS_MESSAGE:
				if (!this.onMessage) return
				const payload = message.payload as PayloadMessage
				this.onMessage({
					subject: payload.subject,
					payload: atob(payload.payload),
				})
				break
			case MSG_TYPE.ERROR:
				break
		}
	}

	handleError(_: Event) {
		//console.log("socket:error:", e)
	}

	//#endregion
}


