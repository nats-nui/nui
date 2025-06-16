import { debounce } from "@/utils/time";
import { docsSo, utils } from "@priolo/jack";
import { SocketService } from ".";
import { EventMessage } from "@/utils/EventEmitter";



class SocketPool {

	sockets: { [key: string]: SocketService } = {}

	getById(key: string) {
		return this.sockets[key]
	}

	/** cerca oppure crea una connessione e gli affibbbia questo ID */
	async create(key: string, cnnId: string): Promise<SocketService | undefined> {
		if (!key || !cnnId) return
		debounce(`ss::destroy::${key}`)
		let ss = this.getById(key)
		if (!ss) {
			ss = new SocketService()
			ss.connect(cnnId)
			this.sockets[key] = ss
			// Wait for the WebSocket to be connected
			await this.waitForConnection(ss)
		}
		return ss
	}

	/** Wait for the WebSocket connection to be established */
	private async waitForConnection(ss: SocketService): Promise<void> {
		return new Promise((resolve, reject) => {
			// If already connected, resolve immediately
			if (ss.websocket && ss.websocket.readyState === WebSocket.OPEN) {
				resolve()
				return
			}

			// Set up timeout to avoid waiting indefinitely
			const timeout = setTimeout(() => {
				ss.emitter.off("connection", onConnectionChange)
				reject(new Error("WebSocket connection timeout"))
			}, 10000) // 10 seconds timeout

			const onConnectionChange = (msg: EventMessage) => {
				const readyState = msg.payload as number
				if (readyState === WebSocket.OPEN) {
					clearTimeout(timeout)
					ss.emitter.off("connection", onConnectionChange)
					resolve()
				} else if (readyState === WebSocket.CLOSED) {
					clearTimeout(timeout)
					ss.emitter.off("connection", onConnectionChange)
					reject(new Error("WebSocket connection failed"))
				}
			}

			// Listen for connection state changes
			ss.emitter.on("connection", onConnectionChange)
		})
	}

	/** chiude la connessione ma non subito. Aspetta 2 secondi prima di farlo: non si sa mai! 
	 * inoltre controlla che non sia gia' utilizzata da qualcun'altro
	*/
	destroy(key: string) {
		const ss = this.getById(key)
		if (!ss) return
		debounce(`ss::destroy::${key}`, () => {
			// se lo usa qualcun'altro alllora non lo eliminare
			if (utils.findAll(docsSo.getAllCards(), { connectionId: ss.cnnId }).length > 0) return
			this.destroyForce(key)
		}, 2000)
	}
	/** forza la chiusura, utile per quando c'e' una modifica */
	destroyForce(key: string) {
		if (!key) return
		const ss = this.getById(key)
		if (!ss) return
		debounce(`ss::destroy::${key}`)
		ss.disconnect()
		delete this.sockets[key]
	}

	/** chiude tutte le connessioni */
	closeAll() {
		Object.keys(this.sockets).forEach(key => {
			const ss = this.getById(key)
			ss.disconnect()
		})
	}
	/** prova a riconnettersi sulle connessioni chiuse */
	connectAll() {
		Object.keys(this.sockets).forEach(key => {
			const ss = this.getById(key)
			ss.connect()
		})
	}

}

export const socketPool = new SocketPool()
