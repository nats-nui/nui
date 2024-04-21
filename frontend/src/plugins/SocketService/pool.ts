import { GetAllCards, deckCardsSo, drawerCardsSo } from "@/stores/docs/cards";
import { findAll } from "@/stores/docs/utils/manage";
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
			if (findAll(GetAllCards(), { connectionId: ss.cnnId }).length > 0) return
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
}

export const socketPool = new SocketPool()
