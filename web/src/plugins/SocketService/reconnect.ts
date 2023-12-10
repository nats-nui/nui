import { SocketService } from "."


export interface ReconnectOptions {
	delay?: number,
	tryMax?: number,
}

const optionsDefault = {
	delay: 3000,
	tryMax: 3,
}

/**
 * se non è connesso allora prova a riconnettersi
 */
export class Reconnect {

	options: ReconnectOptions = null
	server: SocketService = null
	try = 0 //numero di tentativi
	idTimer = null
	enabled = true

	constructor(server: SocketService, options: ReconnectOptions = optionsDefault) {
		this.options = { ...optionsDefault, ...options }
		this.server = server
	}

	start() {
		if ( !this.enabled ) return
		this.stop()
		this.tryUp()
		this.idTimer = setTimeout(() => this.server.connect(), this.options.delay)
	}

	stop() {
		if (!this.idTimer) return
		clearTimeout(this.idTimer)
		this.idTimer = null
	}

	/** aumenta il numero di tentativi senza successo */
	tryUp() {
		this.try++
		//console.log(`socket:reconnect:try:${this.try}`)
		if (this.try == 1) return // primo tentativo non è un problema
		// this.layout().setFiSocket(this.try >= this.options.tryMax
		// 	? SOCKET_STATE.ERROR
		// 	: SOCKET_STATE.WARNING
		// )
		if (this.try == this.options.tryMax) {
			// this.layout().dialogOpen({
			// 	type: "error",
			// 	title: i18n.t("app.socket.dialog.error.title"),
			// 	text: i18n.t("app.socket.dialog.error.text"),
			// 	labelOk: i18n.t("app.socket.dialog.error.ok"),
			// })
		}
	}

	/** azzera il numero di tentativi fatti */
	tryZero() {
		this.try = 0
	}

}