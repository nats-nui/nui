import ajax, { CallOptions } from "@/plugins/AjaxService"
import { CddlSchema } from "@/types/Cbor"

/** INDEX - Get all CDDL schemas */
function index(opt?: CallOptions): Promise<CddlSchema[]> {
	return ajax.get(`cddl`, null, opt)
}

/** GET - Get a specific CDDL schema by ID */
function getById(id: string, opt?: CallOptions): Promise<CddlSchema> {
	if (!id) throw new Error("Schema ID is required")
	return ajax.get(`cddl/${id}`, null, opt)
}

/** GET CONTENT - Get the raw content of a CDDL schema */
function getContent(id: string, opt?: CallOptions): Promise<string> {
	if (!id) throw new Error("Schema ID is required")
	return ajax.get(`cddl/${id}/content`, null, opt)
}

export default {
	index,
	getById,
	getContent,
}
