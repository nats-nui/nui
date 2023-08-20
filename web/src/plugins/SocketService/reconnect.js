/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import {getStoreLayout} from "../../store/layout"
import {SOCKET_STATE} from "./socketStateEnum"
import {log} from "../../lib/utils/log"
import i18n from "i18next"


const optionsDefault = {
	delay: 3000,
	tryMax: 3,
}

export class Reconnect {

	constructor(server, options = optionsDefault) {
		this.options = { ...optionsDefault, ...options }
		this.server = server
		this.layout = ()=>getStoreLayout()
	}

	try = 0 //numero di tentativi
	idTimer = null


	start() {
		this.stop()
		this.tryUp()
		this.idTimer = setTimeout(() => this.server.connect(), this.options.delay)
	}

	stop() {
		if (!this.idTimer) return
		clearTimeout(this.idTimer)
	}

	tryUp() {
		this.try++
		log(`socket:recvonnect:try:${this.try}`)
		if ( this.try==1) return // primo tentativo non è un problema
		this.layout().setFiSocket(this.try >= this.options.tryMax
			? SOCKET_STATE.ERROR
			: SOCKET_STATE.WARNING
		)
		if (this.try == this.options.tryMax) {
			this.layout().dialogOpen({
				type: "error",
				title: i18n.t("app.socket.dialog.error.title"),
				text: i18n.t("app.socket.dialog.error.text"),
				labelOk: i18n.t("app.socket.dialog.error.ok"),
			})
		}
	}

	tryZero() {
		this.try = 0
	}

}