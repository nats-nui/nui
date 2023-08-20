/* eslint eqeqeq: "off" */
import {getStoreLayout} from "../../store/layout";
import {log} from "../../lib/utils/log";

import {Ping} from "./ping";
import {Reconnect} from "./reconnect";
import {Commands} from "./commands"
import {SOCKET_STATE} from "./socketStateEnum.js"

const optionsDefault = {
	protocol: null,
	host: null,
	port: process.env.REACT_APP_WS_PORT,
}


export class SocketService {

	constructor(options = {}) {
		this.options = { ...optionsDefault, ...options }

		const loc = window.location
		if (!this.options.protocol) this.options.protocol = loc.protocol == "http:" ? "ws:" : "wss:"
		if (!this.options.host) this.options.host = loc.hostname
		if (!this.options.port) this.options.port = loc.port

		this.websocket = null
		this.ping = new Ping(this)
		this.reconnect = new Reconnect(this)
		this.commands = new Commands(this)
		this.layout = () => getStoreLayout()
	}

	tokenLast = null

	// tenta di aprire il socket
	connect(token = this.tokenLast) {
		if (this.websocket) return
		if (!token) return
		this.tokenLast = token
		const { protocol, host, port } = this.options

		try {
			this.websocket = new WebSocket(`${protocol}//${host}:${port}/api/events/?token=${token}`);
		} catch (error) {
			console.error(error)
			return
		}

		this.websocket.onopen = this.onOpen.bind(this);
		this.websocket.onclose = this.onClose.bind(this);
		this.websocket.onmessage = this.onMessage.bind(this);
		this.websocket.onerror = this.onError.bind(this);
	}

	// ciude il socket
	clear(newToken = null) {
		if (!this.websocket) return
		this.websocket.close()
		this.websocket = null
		if (newToken) this.tokenLast = newToken
	}

	// diconnette e mantiene chiuso il socket (usato nel logout)
	disconnect() {
		this.tokenLast = null
		this.reconnect.stop()
		this.clear()
	}

	// invia un messaggio al server
	send(data) {
		this.websocket.send(JSON.stringify(data))
	}



	//#region SOCKET EVENT

	onOpen(e) {
		log("socket:open")
		this.reconnect.stop()
		this.reconnect.tryZero()
		this.ping.start()
		this.layout().setFiSocket(this.ping.inAlert == false ? SOCKET_STATE.CONNECT : SOCKET_STATE.CONNECT_ERROR_PING)
	}

	onClose(e) {
		log("socket:close")
		this.ping.stop()
		this.clear()
		if (!this.tokenLast) return
		this.reconnect.start()
	}

	onMessage(e) {
		const data = JSON.parse(e.data)
		log("socket:data:", data)
		this.commands.exe(data)
	}

	onError(e) {
		log("socket:error:", e)
	}

	//#endregion

}

const ss = new SocketService()
export default ss