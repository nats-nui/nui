import ajax from "@/plugins/AjaxService"
import { Message } from "@/types/Message"
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
/** MESSAGES */
function messages(connectionId: string, streamName: string, seqStart?: number, interval?: number, subjects?: string[]): Promise<Message[]> {
	if (!connectionId || !streamName) return
	let query = seqStart!=null ? `seq_start=${seqStart.toString()}&` : ""
	query += interval!=null ? `interval=${interval.toString()}&` : ""
	query += (!!subjects && subjects.length > 0) ? `subjects=${subjects.map(s => `subjects=${s}&`)}` : ""
	return ajax.get(`connection/${connectionId}/stream/${streamName}/messages?${query}`)
}


const api = {
	index,
	remove,
	create,
	update,
	messages,
}
export default api