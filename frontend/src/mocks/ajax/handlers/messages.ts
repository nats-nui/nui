import conn_messages from '@/mocks/data/messages'
import { rest } from 'msw'



const handlers = [

	/** PUBLISH
	 * pubblica un messaggio in una CONNECTION
	 */
	rest.post('/api/connection/:cnnId/messages/publish', async (req, res, ctx) => {
		const { cnnId } = req.params
		const { subject, payload } = await req.json()
		if (!cnnId || !subject || !payload) return res(ctx.status(500))
		return res(
			ctx.delay(1000),
			ctx.status(200),
		)
	}),

	/** SUBSCRIPTIONS INDEX
	 */
	rest.get('/api/connection/:cnnId/messages/subscription', async (req, res, ctx) => {
		const { cnnId } = req.params
		return res(
			ctx.status(200),
			ctx.json(conn_messages[0].subscriptions),
		)
	}),

	/** SUBSCRIPTIONS UPDATE
	 */
	rest.post('/api/connection/:cnnId/messages/subscription', async (req, res, ctx) => {
		const { cnnId } = req.params
		const newSubscriptions = await req.json()
		conn_messages[0].subscriptions = newSubscriptions
		return res(
			ctx.status(200),
			ctx.json(newSubscriptions),
		)
	}),


	/** SYNC MESSAGE 
	 * https://github.com/nats-nui/nui/blob/main/frontend/docs/entities/request_response/request_response.md
	*/
	rest.post('/api/connection/:cnnId/request', async (req, res, ctx) => {
		const { cnnId } = req.params
		const { subject, payload, headers, timeout } = await req.json()
		const response = {
			headers,
			subject,
			payload,
		}
		return res(
			ctx.status(200),
			ctx.json(response),
		)
	}),


]

export default handlers