import ajax, { CallOptions } from "@/plugins/AjaxService"
import { StreamConsumer } from "@/types/Consumer"



/** INDEX */
function index(connectionId: string, streamName:string, opt?: CallOptions): Promise<StreamConsumer[]> {
	return ajax.get(`connection/${connectionId}/stream/${streamName}/consumer`, null, opt)
}

/** GET */
function get(connectionId: string, streamName:string, consumerName:string, opt?: CallOptions): Promise<StreamConsumer> {
	return ajax.get(`connection/${connectionId}/stream/${streamName}/consumer/${consumerName}`, null, opt)
}


const api = {
	index,
	get,
}
export default api