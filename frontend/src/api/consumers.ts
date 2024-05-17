import ajax, { CallOptions } from "@/plugins/AjaxService"
import {ConsumerConfig, StreamConsumer} from "@/types/Consumer"



/** INDEX */
function index(connectionId: string, streamName:string, opt?: CallOptions): Promise<StreamConsumer[]> {
	return ajax.get(`connection/${connectionId}/stream/${streamName}/consumer`, null, opt)
}

/** GET */
function get(connectionId: string, streamName:string, consumerName:string, opt?: CallOptions): Promise<StreamConsumer> {
	return ajax.get(`connection/${connectionId}/stream/${streamName}/consumer/${consumerName}`, null, opt)
}

/** CREATE */
function  create(connectionId: string, streamName:string, consumerConfig: ConsumerConfig, opt?: CallOptions): Promise<StreamConsumer> {
	return ajax.post(`connection/${connectionId}/stream/${streamName}/consumer`, consumerConfig, opt)
}

/** UPDATE */
function  update(connectionId: string, streamName:string, consumerName:string, consumerConfig: ConsumerConfig, opt?: CallOptions): Promise<StreamConsumer> {
	return ajax.put(`connection/${connectionId}/stream/${streamName}/consumer/${consumerName}`, consumerConfig, opt)
}

/** DELETE */
function remove(connectionId: string, streamName:string, consumerName:string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`connection/${connectionId}/stream/${streamName}/consumer/${consumerName}`, null, opt)
}

const api = {
	index,
	get,
	create,
	update,
	remove
}
export default api