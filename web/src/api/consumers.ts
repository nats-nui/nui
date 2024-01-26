import ajax from "@/plugins/AjaxService"
import { ConsumerInfo } from "@/types/Consumer"



/** INDEX */
function index(connectionId: string, streamName:string): Promise<ConsumerInfo[]> {
	return ajax.get(`connection/${connectionId}/stream/${streamName}/consumer`)
}


const api = {
	index,
}
export default api