import ajax, { CallOptions } from "@/plugins/AjaxService"
import { ProtoSchema } from "@/types/Protobuf"

/** INDEX
 * Get all the PROTO SCHEMAs
 */
function index(opt?: CallOptions): Promise<ProtoSchema[]> {
	return ajax.get(`proto`, null, opt)
}

/** GET
 * Get a specific PROTO SCHEMA by ID
 */
function getById(id: string, opt?: CallOptions): Promise<ProtoSchema> {
	if (!id) throw new Error("Schema ID is required")
	return ajax.get(`proto/${id}`, null, opt)
}

/** GET CONTENT
 * Get the raw content of a PROTO SCHEMA
 */
function getContent(id: string, opt?: CallOptions): Promise<string> {
	if (!id) throw new Error("Schema ID is required")
	return ajax.get(`proto/${id}/content`, null, opt)
}

export default {
	index,
	getById,
	getContent,
}