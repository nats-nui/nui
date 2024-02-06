import ajax from "@/plugins/AjaxService"
import { KVEntry } from "@/types/KVEntry"


/** INDEX */
function index(connectionId: string, bucketName: string): Promise<KVEntry[]> {
	return ajax.get(`connection/${connectionId}/bucket/${bucketName}/kv`)
}

/** GET */
function get(connectionId: string, bucketName: string, key: string): Promise<KVEntry> {
	return ajax.get(`connection/${connectionId}/bucket/${bucketName}/kv/${key}`)
}

/** PUT */
function put(connectionId: string, bucketName: string, key: string, payload: string): Promise<KVEntry> {
	const data = {
		payload : btoa(payload)
	}
	return ajax.post(`connection/${connectionId}/bucket/${bucketName}/kv/${key}`, data)
}

/** DELETE */
function remove(connectionId: string, bucketName: string, key: string): Promise<void> {
	return ajax.delete(`connection/${connectionId}/bucket/${bucketName}/kv/${key}`)
}

const api = {
	index,
	get,
	put,
	remove,
}
export default api