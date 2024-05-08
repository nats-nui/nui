import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Subscription } from "@/types"

/** PUBLISH
 * permette di pubblicare un messaggio
 */
function publish(cnnId: string, subject: string, payload: string, opt?: CallOptions) {
	const data = {
		subject,
		payload: btoa(payload)
	}
	return ajax.post(`connection/${cnnId}/messages/publish`, data, opt)
}

/** GET
 * https://github.com/nats-nui/nui/blob/main/frontend/docs/entities/messages/subscription%20index.md
 */
function subscriptionIndex(cnnId: string, opt?: CallOptions): Promise<Subscription[]> {
	return ajax.get(`connection/${cnnId}/messages/subscription`, null, opt)
}

/** UPDATE
 * https://github.com/nats-nui/nui/blob/main/frontend/docs/entities/messages/subscription%20update.md
 */
function subscriptionUpdate(cnnId: string, subscriptions: Subscription[], opt?: CallOptions): Promise<Subscription[]> {
	return ajax.post(`connection/${cnnId}/messages/subscription`, subscriptions, opt)
}

/** SYNC
 * https://github.com/nats-nui/nui/blob/main/frontend/docs/entities/request_response/request_response.md
 */
async function sync(cnnId: string, subject: string, payload: string, timeout: number = 2000, opt?: CallOptions): Promise<SyncResp> {
	const data = {
		subject,
		payload: btoa(payload),
		timeout
	}
	const resp = await ajax.post(`connection/${cnnId}/request`, data, opt) as SyncResp 
	resp.payload = atob(resp.payload) 
	return resp
}

type SyncResp = {
	subject: string,	// response subject
	payload: string, 	// base64 encoded response payload
}

const messagesApi = {
	publish,
	subscriptionIndex,
	subscriptionUpdate,
	sync,
}
export default messagesApi