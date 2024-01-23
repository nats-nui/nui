import ajax from "@/plugins/AjaxService"
import { StreamConfig } from "@/types/Stream"



/** INDEX
 * Recupera tutti gli STREAMS
 */
function index(connectionId: string): Promise<StreamConfig[]> {
	return ajax.get(`connection/${connectionId}/stream`)
}

/** DELETE
 * Rimuove uno STREAM
 */
function remove(id: string): Promise<void> {
	if (!id) return
	return ajax.delete(`stream/${id}`)
}

/** UPDATE
 * crea/modifica uno STREAM
 */
function save(cnn: StreamConfig): Promise<StreamConfig> {
	const blockId = cnn.name ? `/${cnn.name}` : ""
	return ajax.post(`stream${blockId}`, cnn)
}



const api = {
	index,
	remove,
	save,
}
export default api