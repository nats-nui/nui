import ajax from "@/plugins/AjaxService"
import { BucketConfig, BucketState } from "@/types/Bucket"



/** INDEX */
function index(connectionId: string): Promise<BucketState[]> {
	return ajax.get(`connection/${connectionId}/kv`)
}

/** GET */
function get(connectionId: string, bucketName: string): Promise<BucketState> {
	return ajax.get(`connection/${connectionId}/kv/${bucketName}`)
}

/** DELETE */
function remove(connectionId: string, bucketName: string): Promise<BucketState> {
	if (!connectionId || !bucketName) return
	return ajax.delete(`connection/${connectionId}/kv/${bucketName}`)
}

/** CREATE */
function create(connectionId: string, bucket: BucketConfig): Promise<BucketState> {
	if (!connectionId || !bucket) return
	return ajax.post(`connection/${connectionId}/kv`, bucket)
}



const api = {
	index,
	get,
	remove,
	create,
}
export default api