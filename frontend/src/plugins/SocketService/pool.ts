import { debounce } from "@/utils/time";
import { SocketService } from ".";
import cnnSo from "@/stores/connections"
import { CNN_STATUS } from "@/types";



class SocketPool {

	sockets: { [key: string]: SocketService } = {}

	getById(storeId: string) {
		return this.sockets[storeId]
	}

	/** cerca oppure crea una connessione e gli affibbbia questo ID */
	create(storeId: string, cnnId: string) {
		debounce(`ss::destroy::${storeId}`)
		let ss = this.getById(storeId)
		if (!ss) {
			ss = new SocketService()
			ss.connect(cnnId)
			this.sockets[storeId] = ss
		}
		return ss
	}

	/** chiude la connessione ma non subito. Aspetta 2 secondi prima di farlo: non si sa mai! */
	destroy(storeId: string) {
		const ss = this.getById(storeId)
		if (!ss) return
		debounce(`ss::destroy::${storeId}`, () => {
			cnnSo.update({ id: ss.cnnId, status: CNN_STATUS.UNDEFINED })
			ss.disconnect()
			delete this.sockets[storeId]
		}, 2000)
	}
}

export const socketPool = new SocketPool()
