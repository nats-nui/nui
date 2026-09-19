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

function discardSysQuery(noSysMessages: boolean): string {
	return `discard_sys=${noSysMessages ? "true" : "false"}`
}

async function jetstream(cnnId: string, noSysMessages: boolean, opt?: CallOptions): Promise<JetStreamCatalog> {
	return ajax.get(`connection/${cnnId}/subjects/jetstream?${discardSysQuery(noSysMessages)}`, null, opt)
}

async function core(cnnId: string, filter: string, listenMs: number, noSysMessages: boolean, opt?: CallOptions): Promise<CoreCatalog> {
	const params = [
		`filter=${encodeURIComponent(filter)}`,
		`listen_ms=${listenMs}`,
		discardSysQuery(noSysMessages),
	].join("&")
	return ajax.get(`connection/${cnnId}/subjects/core?${params}`, null, opt)
}

async function watch(cnnId: string, filter: string, noSysMessages: boolean, opt?: CallOptions): Promise<CoreCatalog> {
	const params = [
		`filter=${encodeURIComponent(filter)}`,
		`watch=1`,
		discardSysQuery(noSysMessages),
	].join("&")
	return ajax.get(`connection/${cnnId}/subjects/core?${params}`, null, opt)
}

async function unwatch(cnnId: string, opt?: CallOptions): Promise<void> {
	await ajax.delete(`connection/${cnnId}/subjects/core`, null, opt)
}

async function occupied(cnnId: string, stream: string, filter: string | undefined, noSysMessages: boolean, opt?: CallOptions): Promise<OccupiedCatalog> {
	const params = [discardSysQuery(noSysMessages)]
	if (filter) params.push(`filter=${encodeURIComponent(filter)}`)
	return ajax.get(`connection/${cnnId}/subjects/jetstream/${encodeURIComponent(stream)}/occupied?${params.join("&")}`, null, opt)
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
