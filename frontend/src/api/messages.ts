import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Subscription } from "@/types"
import { camelToSnake } from "@/utils/object.ts";

/** PUBLISH
 * permette di pubblicare un messaggio
 */
function publish(cnnId: string, subject: string, payload: string, headersArray: [string, string][], opt: CallOptions = {}) {
	const data = camelToSnake({
		subject,
		payload: btoa(payload)
	})
	// when publishing a message, the headers must not converted to snake case
	// so we add them after the conversion and disable the auto snake case conversion
	data.headers = toDic(headersArray)
	opt.noSnake = true
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
async function sync(cnnId: string, subject: string, payload: string, headersArray: [string, string][], timeout: number = 2000, opt: CallOptions = {}): Promise<SyncResp> {
	const data = camelToSnake({
		subject,
		payload: btoa(payload),
		timeout
	})
	// like publish, also here the auto conversion to snake case is disabled
	data.headers = toDic(headersArray)
	opt.noSnake = true

	const resp = await ajax.post(`connection/${cnnId}/request`, data, opt) as SyncResp
	resp.payload = atob(resp.payload)
	return resp
}

type SyncResp = {
	subject: string,	// response subject
	payload: string, 	// base64 encoded response payload
	headers: { [key: string]: string[] } // response headers
}

const messagesApi = {
	publish,
	subscriptionIndex,
	subscriptionUpdate,
	sync,
}
export default messagesApi


function toDic(arr: [string, string][]): { [key: string]: string[] } {
	const headers: { [key: string]: string[] } = arr.reduce<{ [key: string]: string[] }>((acc, [key, value]) => {
		if (!acc[key]) {
			acc[key] = [value]
		} else {
			acc[key].push(value)
		}
		return acc;
	}, {})
	return headers
}