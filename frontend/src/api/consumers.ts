import ajax from "@/plugins/AjaxService"
import { StreamConsumer } from "@/types/Consumer"



/** INDEX */
function index(connectionId: string, streamName:string): Promise<StreamConsumer[]> {
	return ajax.get(`connection/${connectionId}/stream/${streamName}/consumer`)
}

/** GET */
function get(connectionId: string, streamName:string, consumerName:string): Promise<StreamConsumer> {
	return ajax.get(`connection/${connectionId}/stream/${streamName}/consumer/${consumerName}`)
}


const api = {
	index,
	get,
}
export default api