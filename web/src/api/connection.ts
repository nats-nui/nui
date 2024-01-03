import ajax from "@/plugins/AjaxService"
import { Connection } from "@/types/Connection"


/** INDEX
 * Recupera tutte le CONNECTION
 */
function index(): Promise<Connection[]> {
	return ajax.get(`connection`)
}

/** DELETE
 * Rimuove un CONNECTION 
 */
function remove(id: string): Promise<void> {
	if (!id) return
	return ajax.delete(`connection/${id}`)
}

/** UPDATE
 * Modifica/crea un CONNECTION
 */
function save(cnn: Connection): Promise<Connection> {
	const blockId = cnn.id ? `/${cnn.id}` : ""
	return ajax.post(`connection${blockId}`, cnn)
}

/** PUBLISC
 * permette di pubblicare un messaggio
 */
function publish(cnnId:string, subject:string, payload:string) {
	const data = {
		subject,
		payload : btoa(payload)
	}
	return ajax.post(`connection/${cnnId}/publish`, data)
}

const api = {
	index,
	remove,
	save,
	publish,
}
export default api