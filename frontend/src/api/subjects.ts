import ajax, { CallOptions } from "@/plugins/AjaxService"
import { CoreCatalog, JetStreamCatalog, OccupiedCatalog } from "@/types/Subject"

function jetstream(cnnId: string, noSysMessages: boolean, opt?: CallOptions): Promise<JetStreamCatalog> {
	return ajax.get(`connection/${cnnId}/subjects/jetstream?discard_sys=${noSysMessages}`, null, opt)
}

function core(cnnId: string, filter: string, listenMs: number, noSysMessages: boolean, opt?: CallOptions): Promise<CoreCatalog> {
	const query = `filter=${encodeURIComponent(filter)}&listen_ms=${listenMs}&discard_sys=${noSysMessages}`
	return ajax.get(`connection/${cnnId}/subjects/core?${query}`, null, opt)
}

function occupied(cnnId: string, stream: string, filter: string | undefined, noSysMessages: boolean, opt?: CallOptions): Promise<OccupiedCatalog> {
	const query = filter ? `&filter=${encodeURIComponent(filter)}` : ""
	return ajax.get(`connection/${cnnId}/subjects/jetstream/${stream}/occupied?discard_sys=${noSysMessages}${query}`, null, opt)
}

const api = { jetstream, core, occupied }
export default api
