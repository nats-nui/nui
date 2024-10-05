import ajax, { CallOptions } from "@/plugins/AjaxService"
import { BucketConfig, BucketState } from "@/types/Bucket"



/** INDEX */
function index(connectionId: string, opt?: CallOptions): Promise<BucketState[]> {
	return ajax.get(`connection/${connectionId}/kv`, null, opt)
}

/** GET */
function get(connectionId: string, bucketName: string, opt?: CallOptions): Promise<BucketState> {
	return ajax.get(`connection/${connectionId}/kv/${bucketName}`, null, opt)
}

/** DELETE */
function remove(connectionId: string, bucketName: string, opt?: CallOptions): Promise<BucketState> {
	if (!connectionId || !bucketName) return
	return ajax.delete(`connection/${connectionId}/kv/${bucketName}`, null, opt)
}

/** CREATE */
function create(connectionId: string, bucket: BucketConfig, opt?: CallOptions): Promise<BucketState> {
	if (!connectionId || !bucket) return
	return ajax.post(`connection/${connectionId}/kv`, bucket, opt)
}

/** UPDATE */
function update(connectionId: string, bucket: BucketConfig, opt?: CallOptions): Promise<BucketState> {
	if (!connectionId || !bucket) return
	return ajax.post(`connection/${connectionId}/kv/${bucket.bucket}`, bucket, opt)
}

/** PURGE DELETED keys from bucket */
function purgeDeleted(connectionId: string, bucketName: string, opt?: CallOptions): Promise<void> {
	return ajax.post(`connection/${connectionId}/kv/${bucketName}/purge_deleted`, null, opt)
}


const api = {
	index,
	get,
	remove,
	create,
	purgeDeleted
}
export default api