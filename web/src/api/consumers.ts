import ajax from "@/plugins/AjaxService"
import { StreamConsumer } from "@/types/Consumer"



/** INDEX */
function index(connectionId: string, streamName:string): Promise<StreamConsumer[]> {
	return ajax.get(`connection/${connectionId}/stream/${streamName}/consumer`)
}


const api = {
	index,
}
export default api