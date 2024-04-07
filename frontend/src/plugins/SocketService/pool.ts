import { deckCardsSo, drawerCardsSo, menuCardsSo } from "@/stores/docs/cards";
import { debounce } from "@/utils/time";
import { SocketService } from ".";



class SocketPool {

	sockets: { [key: string]: SocketService } = {}

	getById(key: string) {
		return this.sockets[key]
	}

	/** cerca oppure crea una connessione e gli affibbbia questo ID */
	create(key: string, cnnId: string) {
		if (!key || !cnnId) return
		debounce(`ss::destroy::${key}`)
		let ss = this.getById(key)
		if (!ss) {
			ss = new SocketService()
			ss.connect(cnnId)
			this.sockets[key] = ss
		}
		return ss
	}

	/** chiude la connessione ma non subito. Aspetta 2 secondi prima di farlo: non si sa mai! 
	 * inoltre controlla che non sia gia' utilizzata da qualcun'altro
	*/
	destroy(key: string) {
		const ss = this.getById(key)
		if (!ss) return
		debounce(`ss::destroy::${key}`, () => {
			// se lo usa qualcun'altro alllora non lo eliminare
			const filter = { connectionId: ss.cnnId }
			// [II] TODO
			if (deckCardsSo.findAll(filter).length > 0
				|| menuCardsSo.findAll(filter).length > 0 
				|| drawerCardsSo.findAll(filter).length > 0
			) return
			ss.disconnect()
			delete this.sockets[key]
		}, 2000)
	}
}

export const socketPool = new SocketPool()
