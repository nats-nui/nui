import { debounce } from "@/utils/time";
import { SocketService } from ".";
import cnnSo from "@/stores/connections"
import { CNN_STATUS } from "@/types";



class SocketPool {

	sockets: { [key: string]: SocketService } = {}

	getById(key: string) {
		return this.sockets[key]
	}

	/** cerca oppure crea una connessione e gli affibbbia questo ID */
	create(key: string, cnnId: string) {
		debounce(`ss::destroy::${key}`)
		let ss = this.getById(key)
		if (!ss) {
			ss = new SocketService()
			ss.connect(cnnId)
			this.sockets[key] = ss
		}
		return ss
	}

	/** chiude la connessione ma non subito. Aspetta 2 secondi prima di farlo: non si sa mai! */
	destroy(key: string) {
		const ss = this.getById(key)
		if (!ss) return
		debounce(`ss::destroy::${key}`, () => {
			cnnSo.update({ id: ss.cnnId, status: CNN_STATUS.UNDEFINED })
			ss.disconnect()
			delete this.sockets[key]
		}, 2000)
	}
}

export const socketPool = new SocketPool()
