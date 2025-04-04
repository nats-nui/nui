import ajax, { CallOptions } from "@/plugins/AjaxService"
import { CliImport, Connection } from "@/types/Connection"


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

function importFromNatsCli(path: string, opt?: CallOptions): Promise<{ connections: Connection[], imports: CliImport[]}> {
	return ajax.post(`connection/import/nats-cli`, {path: path}, opt)
}

const connectionApi = {
	index,
	remove,
	save,
	importFromNatsCli,
}
export default connectionApi