import ajax from "@/plugins/AjaxService"
import { Stream } from "@/types/Stream"



/**
 * Recupera tutti gli STREAMS
 */
function index(): Promise<Stream[]> {
	return ajax.get(`stream`)
}

/**
 * Rimuove un STREAM 
 */
function remove(id: string): Promise<void> {
	if (!id) return
	return ajax.delete(`stream/${id}`)
}

/**
 * Modifica/crea un CONNECTION
 */
function save(cnn: Stream): Promise<Stream> {
	const blockId = cnn.id ? `/${cnn.id}` : ""
	return ajax.post(`stream${blockId}`, cnn)
}



const api = {
	index,
	remove,
	save,
}
export default api