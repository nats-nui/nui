import ajax, { CallOptions } from "@/plugins/AjaxService"
import {ConsumerConfig, StreamConsumer} from "@/types/Consumer"
import dayjs from "dayjs";

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
	updateConsumerConfig(consumerConfig)
	return ajax.post(`connection/${connectionId}/stream/${streamName}/consumer`, consumerConfig, opt)
}

/** UPDATE */
function  update(connectionId: string, streamName:string, consumerName:string, consumerConfig: ConsumerConfig, opt?: CallOptions): Promise<StreamConsumer> {
	updateConsumerConfig(consumerConfig)
	return ajax.post(`connection/${connectionId}/stream/${streamName}/consumer/${consumerName}`, consumerConfig, opt)
}

/** DELETE */
function remove(connectionId: string, streamName:string, consumerName:string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`connection/${connectionId}/stream/${streamName}/consumer/${consumerName}`, null, opt)
}

function updateConsumerConfig(consumerConfig: ConsumerConfig) {
	// update datetime field to match the required API format
	convertDateFieldToISO(consumerConfig, "optStartTime")
	convertDateFieldToISO(consumerConfig, "pauseUntil")
}

// Converts a date field to ISO string if valid
function convertDateFieldToISO(obj: any, field: string) {
	if (obj[field] === "") {
		obj[field] = null
		return
	}
	if (obj[field]) {
		const dateTime = dayjs(obj[field])
		if (!dateTime.isValid()) return
		obj[field] = dateTime.toISOString()
	}
}



const api = {
	index,
	get,
	create,
	update,
	remove
}
export default api
