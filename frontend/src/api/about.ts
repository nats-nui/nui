import ajax, { CallOptions } from "@/plugins/AjaxService"
import { About } from "@/types/About"



/** INDEX */
function get(opt?: CallOptions): Promise<About> {
	return ajax.get(`about`, null, opt)
}

const aboutApi = {
	get,
}
export default aboutApi