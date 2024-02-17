import ajax, { CallOptions } from "@/plugins/AjaxService"
import { KVEntry } from "@/types/KVEntry"


/** INDEX */
function index(connectionId: string, bucketName: string, opt?: CallOptions): Promise<KVEntry[]> {
	return ajax.get(`connection/${connectionId}/kv/${bucketName}/key`, null, opt)
}

/** GET */
function get(connectionId: string, bucketName: string, key: string, opt?: CallOptions): Promise<KVEntry> {
	return ajax.get(`connection/${connectionId}/kv/${bucketName}/key/${key}`, null, opt)
}

/** PUT */
function put(connectionId: string, bucketName: string, key: string, payload: string, opt?: CallOptions): Promise<KVEntry> {
	const data = {
		payload : btoa(payload)
	}
	return ajax.post(`connection/${connectionId}/kv/${bucketName}/key/${key}`, data, opt)
}

/** DELETE */
function remove(connectionId: string, bucketName: string, key: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`connection/${connectionId}/kv/${bucketName}/key/${key}`, null, opt)
}

const api = {
	index,
	get,
	put,
	remove
}
export default api