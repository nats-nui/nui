/* eslint eqeqeq: "off" */
import {getStoreLayout} from "../../store/layout"
import {SOCKET_STATE} from "./socketStateEnum"
import {log} from "../../lib/utils/log"


const optionsDefault = {
	checkDelay: 2000,
	checkTimeAlert: 4000,
}

export class Ping {

	constructor ( server, options=optionsDefault ) {
		this.options = { ...optionsDefault, ...options }
		this.server = server
		this.layout = ()=>getStoreLayout()
	}

	checkId = null
	checkLastTime = null
	inAlert = false // indica che sono in errore ping


	
	start() {
		if (this.checkId) return
		this.checkLastTime = Date.now()
		this.checkId = setInterval( this.onInterval.bind(this), this.options.checkDelay)
	}

	stop() {
		if (!this.checkId) return
		clearInterval(this.checkId)
		this.checkId = null
	}

	onInterval() {
		const current = Date.now()
		const delta = current - this.checkLastTime
		if (delta >= this.options.checkTimeAlert) {
			if (!this.inAlert) this.onAlert()
			this.inAlert = true
		} else {
			if ( this.inAlert==true ) this.layout().setFiSocket(SOCKET_STATE.CONNECT)
			this.inAlert = false
		}
	}

	onAlert() {
		this.layout().setFiSocket(SOCKET_STATE.CONNECT_ERROR_PING)
		log("socket:ping:alert")
		this.server.clear() // chiudo il socket (automaticamente partirà il retry)
	}

	onMessage() {
		this.checkLastTime = Date.now()
	}

}