import ajax, { CallOptions } from "@/plugins/AjaxService"
import {CliConnectionImport, Connection} from "@/types/Connection"


/** INDEX
 * Get all the CONNECTIONs
 */
function index(opt?: CallOptions): Promise<Connection[]> {
	return ajax.get(`connection`, null, opt)
}

/** UPDATE
 * Update a CONNECTION
 */
function save(cnn: Connection, opt?: CallOptions): Promise<Connection> {
	const blockId = cnn.id ? `/${cnn.id}` : ""
	return ajax.post(`connection${blockId}`, cnn, opt)
}

/** DELETE
 * delete a CONNECTION
 */
function remove(id: string, opt?: CallOptions): Promise<void> {
	if (!id) return
	return ajax.delete(`connection/${id}`, null, opt)
}

function importFromNatsCli(path: string): Promise<{ connections: Connection[], imports: CliConnectionImport[]}> {
	return ajax.post(`connection/import/nats-cli`, {path: path})
}

const api = {
	index,
	remove,
	save,
}
export default api