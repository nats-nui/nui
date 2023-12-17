import { SocketService } from ".";



class SocketPool {

	sockets: { [key: string]: SocketService } = {}

	getById(storeId: string) {
		return this.sockets[storeId]
	}

	/** preleva oppure se non c'e' crea una connessione e gli affibbbia questo ID */
	create(storeId: string, cnnId: string) {
		let ss = this.getById(storeId)
		if (!ss) {
			ss = new SocketService()
			this.sockets[storeId] = ss
		}
		ss.connect(cnnId)
		return ss
	}

	destroy(storeId: string) {
		const ss = this.getById(storeId)
		if ( !ss ) return
		ss.disconnect()
		delete this.sockets[storeId]
	}
}

export const socketPool = new SocketPool()
