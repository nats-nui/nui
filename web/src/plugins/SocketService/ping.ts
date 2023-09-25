import { SocketService } from "."



export interface PingOptions {
	checkDelay?: number,
	checkTimeAlert?: number,
}

const optionsDefault: PingOptions = {
	checkDelay: 2000,
	checkTimeAlert: 4000,
}

/**
 * Esegue un ping per assicurarsi che ci sia una connessione
 */
export class Ping {

	/** le opzioni di connessione */
	options: PingOptions = null
	server: SocketService = null
	/** id dell' "intevall" */
	checkId:number = null
	checkLastTime:number = null
	inAlert = false // indica che sono in errore ping

	constructor(server: SocketService, options: PingOptions = optionsDefault) {
		this.options = { ...optionsDefault, ...options }
		this.server = server
	}

	/**
	 * Avvia l'INTERVALL
	 */
	start() {
		if (this.checkId) return
		this.checkLastTime = Date.now()
		this.checkId = setInterval(this.onInterval.bind(this), this.options.checkDelay) as any
	}

	/**
	 * Ferma l'INTERVALL
	 */
	stop() {
		if (!this.checkId) return
		clearInterval(this.checkId)
		this.checkId = null
	}

	/**
	 * su intervall
	 * controllare non sia passato troppo tempo dall'ultimo messaggio arrivato
	 */
	onInterval() {
		const current = Date.now()
		const delta = current - this.checkLastTime
		if (delta >= this.options.checkTimeAlert) {
			if (!this.inAlert) this.onAlert()
			this.inAlert = true
		} else {
			//if (this.inAlert == true) this.layout().setFiSocket(SOCKET_STATE.CONNECT)
			this.inAlert = false
		}
	}

	/** 
	 * troppo tempo dall'ultimo messaggio arrivato 
	 */
	onAlert() {
		//this.layout().setFiSocket(SOCKET_STATE.CONNECT_ERROR_PING)
		console.log("socket:ping:alert")
		this.server.clear() // chiudo il socket (automaticamente partirà il retry)
	}

	/**
	 * arrivato messaggio dal server
	 * resetto il timer di alert
	 */
	onMessage() {
		this.checkLastTime = Date.now()
	}

}