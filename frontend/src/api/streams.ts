import ajax, { CallOptions } from "@/plugins/AjaxService";
import { StreamMessagesFilter } from "@/stores/stacks/streams/utils/filter";
import { Message } from "@/types/Message";
import { StreamConfig, StreamInfo } from "@/types/Stream";
import { snakeToCamel } from "@/utils/object";



/** INDEX */
function index(connectionId: string, opt?: CallOptions): Promise<StreamInfo[]> {
	return ajax.get(`connection/${connectionId}/stream`, null, opt)
}

/** GET */
function get(connectionId: string, streamName: string, opt?: CallOptions): Promise<StreamInfo> {
	lkòdlòsljdlò
	opt.noCamel = true
	const res:StreamInfo = ajax.get(`connection/${connectionId}/stream/${streamName}`, null, opt)
	const resCamel = snakeToCamel(res)
	resCamel.
	return 
}

/** DELETE */
function remove(connectionId: string, streamName: string, opt?: CallOptions): Promise<void> {
	if (!connectionId || !streamName) return
	return ajax.delete(`connection/${connectionId}/stream/${streamName}`, null, opt)
}

function purge(connectionId: string, streamName: string, seq: number, keep: number, subject: string, opt?: CallOptions): Promise<void> {
	if (!connectionId || !streamName) return
	return ajax.post(`connection/${connectionId}/stream/${streamName}/purge`, { seq, keep, subject }, opt)
}

/** CREATE */
function create(connectionId: string, stream: StreamConfig, opt?: CallOptions): Promise<StreamInfo> {
	if (!connectionId || !stream) return
	return ajax.post(`connection/${connectionId}/stream`, stream, opt)
}
/** UPDATE */
function update(connectionId: string, stream: StreamConfig, opt?: CallOptions): Promise<StreamInfo> {
	if (!connectionId || !stream) return
	return ajax.post(`connection/${connectionId}/stream/${stream.name}`, stream, opt)
}

/** MESSAGES 
 * https://github.com/nats-nui/nui/blob/main/frontend/docs/entities/stream_messages/index.md
*/
async function messages(connectionId: string, streamName: string, filter: StreamMessagesFilter, opt?: CallOptions): Promise<Message[]> {
	if (!connectionId || !streamName || !filter
		|| (filter.byTime && filter.startTime == null)
		|| (!filter.byTime && filter.startSeq == null)
	) return

	let query = !filter.byTime ? `seq_start=${filter.startSeq.toString()}&` : `time_start=${filter.startTime.toString()}&`
	query += filter.interval != null ? `interval=${filter.interval.toString()}&` : ""
	query += (!!filter.subjects && filter.subjects.length > 0) 
		? `subjects=${filter.subjects.join(",")}` 
		: ""

	const messages: Message[] = await ajax.get(`connection/${connectionId}/stream/${streamName}/messages?${query}`, null, opt)
	return messages.map(m => {
		m.payload = atob(m.payload)
		return m
	})
}
/** DELETE MESSAGE */
function messageRemove(connectionId: string, streamName: string, sequence: number, opt?: CallOptions): Promise<void> {
	if (!connectionId || !streamName || !sequence) return
	return ajax.delete(`connection/${connectionId}/stream/${streamName}/messages/${sequence}`, null, opt)
}


function _error(connectionId: string, opt?: CallOptions): Promise<StreamInfo[]> {
	return ajax.get(`connection/${connectionId}/stream_error`, null, opt)
}


const api = {
	_error,
	index,
	get,
	remove,
	create,
	update,
	purge,
	messages,
	messageRemove,
}
export default api