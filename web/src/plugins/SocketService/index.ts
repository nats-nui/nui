/* eslint eqeqeq: "off" */
import { Ping } from "./ping.js";
import { Reconnect } from "./reconnect.js";
import { Commands } from "./commands.js"



export interface SocketOptions {
	protocol?: string
	host?: string
	port?: string
	base?: string
}

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
	tokenLast: string = null
	ping: Ping;
	reconnect: Reconnect;
	commands: Commands;

	constructor(options: SocketOptions = {}) {
		this.options = { ...optionsDefault, ...options }
		this.websocket = null

		this.ping = new Ping(this)
		this.reconnect = new Reconnect(this)
		this.commands = new Commands(this)
	}

	/** 
	 * tenta di aprire il socket
	 */
	connect(token: string = this.tokenLast) {
		if (this.websocket) return
		this.tokenLast = token
		const { protocol, host, port, base } = this.options

		try {
			let url = `${protocol}//${host}:${port}`
			if ( base ) url = `${url}/${base}`
			if ( token ) url = `${url}?token=${token}`
			this.websocket = new WebSocket(url);
		} catch (error) {
			console.error(error)
			return
		}

		this.websocket.onopen = this.onOpen.bind(this);
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
		if (newToken) this.tokenLast = newToken
	}

	/** 
	 * diconnette e mantiene chiuso il socket (usato nel logout)
	 */
	disconnect() {
		this.tokenLast = null
		this.reconnect.stop()
		this.clear()
	}

	/** 
	 * invia un messaggio al server
	 */
	send(data: any) {
		this.websocket.send(JSON.stringify(data))
	}

	//#region SOCKET EVENT

	onOpen(e: Event) {
		console.log("socket:open")
		this.reconnect.stop()
		this.reconnect.tryZero()
		this.ping.start()
		//this.layout().setFiSocket(this.ping.inAlert == false ? SOCKET_STATE.CONNECT : SOCKET_STATE.CONNECT_ERROR_PING)
	}

	onClose(e: CloseEvent) {
		console.log("socket:close")
		this.ping.stop()
		this.clear()
		if (!this.tokenLast) return
		this.reconnect.start()
	}

	onMessage(e: MessageEvent) {
		const data = JSON.parse(e.data)
		console.log("socket:data:", data)
		this.commands.exe(data)
	}

	onError(e: Event) {
		console.log("socket:error:", e)
	}

	//#endregion

}

const ss = new SocketService()
export default ss