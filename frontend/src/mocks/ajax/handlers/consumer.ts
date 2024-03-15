import { rest } from 'msw'
import consumers from "../../data/consumer"



const handlers = [

	/** INDEX */
	rest.get('/api/connection/:connId/stream/:streamName/consumer', async (req, res, ctx) => {
		const { cnnId, streamName } = req.params
		return res(
			ctx.status(200),
			ctx.json(consumers),
		)
	}),

	/** GET */
	rest.get('/api/connection/:connId/stream/:streamName/consumer/:consumerName', async (req, res, ctx) => {
		const { cnnId, streamName, consumerName } = req.params
		const consumer = consumers.find(c => c.name = consumerName)
		if (!consumer) return res(ctx.status(404))
		return res(
			ctx.status(200),
			ctx.json(consumer),
		)
	}),


]

export default handlers