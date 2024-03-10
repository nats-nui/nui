import ajax, { CallOptions } from "@/plugins/AjaxService"
import { KVEntry } from "@/types/KVEntry"


/** INDEX */
function index(connectionId: string, bucketName: string, opt?: CallOptions): Promise<KVEntry[]> {
	return ajax.get(`connection/${connectionId}/kv/${bucketName}/key`, null, opt)
}

/** GET */
async function get(connectionId: string, bucketName: string, key: string, opt?: CallOptions): Promise<KVEntry> {
	const kventry: KVEntry = await ajax.get(`connection/${connectionId}/kv/${bucketName}/key/${key}`, null, opt)
	kventry.payload = atob(kventry.payload)
	kventry.history?.forEach(kve => kve.payload = atob(kve.payload))
	return kventry
}

/** PUT */
async function put(connectionId: string, bucketName: string, key: string, payload: string, opt?: CallOptions): Promise<KVEntry> {
	const data = { payload: btoa(payload) }
	const kventry: KVEntry = await ajax.post(`connection/${connectionId}/kv/${bucketName}/key/${key}`, data, opt)
	kventry.payload = atob(kventry.payload)
	return kventry
}

/** DELETE */
function remove(connectionId: string, bucketName: string, key: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`connection/${connectionId}/kv/${bucketName}/key/${key}`, null, opt)
}

/** PURGE */
function purge(connectionId: string, bucketName: string, key: string, opt?: CallOptions): Promise<void> {
	return ajax.post(`connection/${connectionId}/kv/${bucketName}/key/${key}/purge`, {}, opt)
}

const api = {
	index,
	get,
	put,
	remove,
	purge
}
export default api