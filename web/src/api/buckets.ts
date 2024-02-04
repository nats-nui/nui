import ajax from "@/plugins/AjaxService"
import { BucketConfig, BucketState } from "@/types/Bucket"



/** INDEX */
function index(connectionId: string): Promise<BucketState[]> {
	return ajax.get(`connection/${connectionId}/kv`)
}

/** DELETE */
function get(connectionId: string, bucketName: string): Promise<BucketState> {
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
	create,
}
export default api