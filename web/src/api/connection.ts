import ajax from "@/plugins/AjaxService"
import { Connection } from "@/types/Connection"


/**
 * Recupera tutte le CONNECTION
 */
function index(): Promise<{ data: Connection[] }> {
	return ajax.get(`connection`)
}

/**
 * Rimuove un CONNECTION 
 */
function remove(id: string): Promise<void> {
	if (!id) return
	return ajax.delete(`connection/${id}`)
}

/**
 * Modifica/crea un CONNECTION
 */
function save(cnn: Connection): Promise<{ data: Connection }> {
	const blockId = cnn.id ? `/${cnn.id}` : ""
	return ajax.post(`connection${blockId}`, cnn)
}

function publish(cnnId:string, subject:string, payload:string) {
	const data = {
		subject,
		payload
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