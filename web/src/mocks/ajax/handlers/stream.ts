import { rest } from 'msw'
import streams from "../../data/streams"



const handlers = [

	/** INDEX
	 * Preleva tutti gli STREAMS di una determinata CONNECTION
	 */
	rest.get('/api/connection/:connId/stream', async (req, res, ctx) => {
		const { cnnId } = req.params
		return res(
			ctx.status(200),
			ctx.json(streams),
		)
	}),

	/** CREATE */
	rest.post('/api/connection/:cnnId/stream', async (req, res, ctx) => {
		const streamConfig = await req.json()
		if (!streamConfig) return res(ctx.status(500))
		const streamInfo = {
			config: streamConfig,
			state: {}
		}
		streams.push(streamInfo)
		return res(
			ctx.status(201),
			ctx.json(streamInfo),
		)
	}),

	/** UPDATE */
	rest.post('/api/connection/:cnnId/stream/:name', async (req, res, ctx) => {
		const name = req.params.name
		const streamConfig = await req.json()
		if (!name || !streamConfig) return res(ctx.status(500))

		const index = streams.findIndex(si => si.config.name == name)
		if (index == -1) return res(ctx.status(404))

		streams[index] = { ...streams[index], config: streamConfig }

		return res(
			ctx.status(200),
			ctx.json(streams[index]),
		)
	}),

	/** DELETE */
	rest.delete('/api/connection/:cnnId/stream/:name', async (req, res, ctx) => {
		const name = req.params.name
		if (!name) return res(ctx.status(500))

		const index = streams.findIndex(si => si.config.name == name)
		if (index == -1) return res(ctx.status(500))
		streams.splice(index, 1)

		return res(
			ctx.status(200),
		)
	}),

]

export default handlers