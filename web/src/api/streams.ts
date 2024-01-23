import ajax from "@/plugins/AjaxService"
import { StreamConfig, StreamInfo } from "@/types/Stream"



/** INDEX */
function index(connectionId: string): Promise<StreamInfo[]> {
	return ajax.get(`connection/${connectionId}/stream`)
}

/** DELETE */
function remove(connectionId: string, streamName: string): Promise<void> {
	if (!connectionId || !streamName) return
	return ajax.delete(`connection/${connectionId}/stream/${streamName}`)
}

/** CREATE */
function create(connectionId: string, stream: StreamConfig): Promise<StreamInfo> {
	if (!connectionId || !stream) return
	return ajax.post(`connection/${connectionId}/stream`, stream)
}
/** UPDATE */
function update(connectionId: string, stream: StreamConfig): Promise<StreamInfo> {
	if (!connectionId || !stream) return
	return ajax.post(`connection/${connectionId}/stream/${stream.name}`, stream)
}



const api = {
	index,
	remove,
	create,
	update,
}
export default api