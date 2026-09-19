import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Message } from "@/types/Message"
import { CoreCatalog, JetStreamCatalog, OccupiedCatalog } from "@/types/Subject"

function decodePayload(value?: string): string | undefined {
	if (!value) return value
	try {
		return atob(value)
	} catch {
		return value
	}
}

async function jetstream(cnnId: string, opt?: CallOptions): Promise<JetStreamCatalog> {
	return ajax.get(`connection/${cnnId}/subjects/jetstream`, null, opt)
}

async function core(cnnId: string, filter: string, listenMs: number, opt?: CallOptions): Promise<CoreCatalog> {
	const params = [
		`filter=${encodeURIComponent(filter)}`,
		`listen_ms=${listenMs}`,
	].join("&")
	return ajax.get(`connection/${cnnId}/subjects/core?${params}`, null, opt)
}

async function watch(cnnId: string, filter: string, opt?: CallOptions): Promise<CoreCatalog> {
	const params = [
		`filter=${encodeURIComponent(filter)}`,
		`watch=1`,
	].join("&")
	return ajax.get(`connection/${cnnId}/subjects/core?${params}`, null, opt)
}

async function unwatch(cnnId: string, opt?: CallOptions): Promise<void> {
	await ajax.delete(`connection/${cnnId}/subjects/core`, null, opt)
}

async function occupied(cnnId: string, stream: string, filter?: string, opt?: CallOptions): Promise<OccupiedCatalog> {
	const q = filter ? `?filter=${encodeURIComponent(filter)}` : ""
	return ajax.get(`connection/${cnnId}/subjects/jetstream/${encodeURIComponent(stream)}/occupied${q}`, null, opt)
}

async function last(cnnId: string, subject: string, stream: string, opt?: CallOptions): Promise<Message> {
	const message: Message = await ajax.get(
		`connection/${cnnId}/subjects/last?subject=${encodeURIComponent(subject)}&stream=${encodeURIComponent(stream)}`,
		null,
		opt,
	)
	if (message?.payload) message.payload = decodePayload(message.payload)
	return message
}

const api = { jetstream, core, watch, unwatch, occupied, last }
export default api
