import logSo from "@/stores/log/index.js";
import { Reconnect } from "./reconnect.js";
import { MSG_TYPE, Payload, PayloadError, PayloadMessage, PayloadStatus, SocketMessage, SocketOptions } from "./types.js";
import { MESSAGE_TYPE } from "@/stores/log/utils.js";
import { optionsDefault } from "./utils.js";
import cnnSo from "@/stores/connections"
import { CNN_STATUS } from "@/types/Connection.js";



/**
 * Crea una connessione WS
 * gestisce le riconnessioni
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
	onStatus?: (payload: PayloadStatus) => void
	onError?: (error: PayloadError) => void

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
			logSo.add({
				type: MESSAGE_TYPE.INFO,
				title: "WS-CONNECTIONS",
				body: `try_connecting`,
				data: url,
			})
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
		logSo.add({
			type: MESSAGE_TYPE.INFO,
			title: "WS-CONNECTIONS",
			body: `disconnect`
		})
		changeConnectionStatus(this.cnnId, CNN_STATUS.UNDEFINED)
		this.cnnId = null
		this.reconnect.enabled = false
		this.reconnect.stop()
		this.clear()
	}

	/** 
	 * invia un messaggio al server
	 */
	send(msg: string) {
		logSo.add({
			type: MESSAGE_TYPE.INFO,
			title: "WS-CONNECTIONS",
			body: `send:FE>BE`,
			data: msg,
		})
		this.websocket.send(msg)
	}

	sendSubjects(subjects: string[]) {
		logSo.add({
			type: MESSAGE_TYPE.INFO,
			title: "WS-CONNECTIONS",
			body: `send:FE>BE`,
			data: subjects
		})
		const msg: SocketMessage = {
			type: MSG_TYPE.SUB_REQUEST,
			payload: { subjects },
		}
		try {
			const msgStr = JSON.stringify(msg)
			this.send(msgStr)
		} catch (err) {
			logSo.addError(err)
		}
	}

	//#region SOCKET EVENT

	handleOpen(_: Event) {
		//console.log("socket:open")
		this.reconnect.stop()
		this.reconnect.tryZero()
		this.onOpen?.()
		changeConnectionStatus(this.cnnId, CNN_STATUS.RECONNECTING)
	}

	handleClose(_: CloseEvent) {
		//console.log("socket:close")
		this.clear()
		this.reconnect.start()
		changeConnectionStatus(this.cnnId, CNN_STATUS.RECONNECTING)
	}

	/** ricevo un messaggio dal BE */
	handleMessage(e: MessageEvent) {
		const message: SocketMessage = JSON.parse(e.data) as SocketMessage
		const type = message.type
		let payload: Payload = null
		switch (type) {
			case MSG_TYPE.CNN_STATUS:
				payload = message.payload as PayloadStatus
				this.onStatus?.(payload)
				changeConnectionStatus(this.cnnId, payload.status)
				let body = `${payload.status}`
				if (payload.error) {body += ` - ${payload.error}`}
				logSo.add({
					type: MESSAGE_TYPE.INFO,
					title: "CONNECTION STATUS",
					body: body
				})
				break
			case MSG_TYPE.NATS_MESSAGE:
				if (!this.onMessage) return
				payload = message.payload as PayloadMessage
				this.onMessage({
					subject: payload.subject,
					payload: atob(payload.payload),
				})
				break
			case MSG_TYPE.ERROR:
				const error: string = (message.payload as PayloadError)?.error
				//this.onError?.(message.payload as PayloadError)
				logSo.add({
					type: MESSAGE_TYPE.ERROR,
					title: "WS-CONNECTIONS-ERROR",
					body: error,
				})
				break
		}
	}

	handleError(e: Event) {
		logSo.add({
			type: MESSAGE_TYPE.ERROR,
			title: "WS-CONNECTIONS",
			body: `error`
		})
	}

	//#endregion
}


function changeConnectionStatus(cnnId: string, status: CNN_STATUS) {
	const cnn = cnnSo.getById(cnnId)
	if (!cnn || cnn.status == status) return
	cnnSo.update({ id: cnnId, status })
}