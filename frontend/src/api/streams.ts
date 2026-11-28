import ajax, { CallOptions } from "@/plugins/AjaxService";
import { StreamMessagesFilter } from "@/stores/stacks/streams/utils/filter";
import { Message } from "@/types/Message";
import { StreamConfig, StreamInfo } from "@/types/Stream";
import { snakeToCamel } from "@/utils/object";
import dayjs from "dayjs";



/** INDEX */
function index(connectionId: string, opt?: CallOptions): Promise<StreamInfo[]> {
	return ajax.get(`connection/${connectionId}/stream`, null, opt)
}

/** GET */
async function get(connectionId: string, streamName: string, opt?: CallOptions, subject?: string): Promise<StreamInfo> {
	const query = subject ? `?subject=${encodeURIComponent(subject)}` : ""
	const resSnake = await ajax.get(`connection/${connectionId}/stream/${streamName}${query}`, null, { ...opt, noCamel: true })
	const resCamel: StreamInfo = snakeToCamel(resSnake)
	if ( !!resCamel ) resCamel.state.subjects = resSnake.state.subjects
	return resCamel
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
	) return

	let query = ""
	let interval = filter.interval
	if ( filter.byTime ) {
		const dateTime = dayjs(filter.startTime)
		if ( !dateTime.isValid()) return
		query = `start_time=${dateTime.toISOString()}&`
	} else if (filter.startSeq != null) {
		query = `seq_start=${filter.startSeq.toString()}&`
	} else if (interval) {
		// A negative interval without a sequence reads from the current stream tail.
		interval = -Math.abs(interval)
	} else {
		return
	}
	query += interval != null ? `interval=${interval}&` : ""
	if (filter.subjects?.length) {
		if (filter.subjects.some(subject => subject.includes(","))) {
			query += filter.subjects.map(subject => `subject=${encodeURIComponent(subject)}`).join("&")
		} else {
			query += `subjects=${encodeURIComponent(filter.subjects.join(","))}`
		}
	}

	const messages: Message[] = await ajax.get(`connection/${connectionId}/stream/${streamName}/messages?${query}`, null, opt)
	return (messages ?? []).map(m => {
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