import { rest } from 'msw'
import streams from "../../data/streams"
import { createUUID } from '@/mocks/data/utils'



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

	/** CREATE
	 * crea una CONNECTION
	 */
	rest.post('/api/stream', async (req, res, ctx) => {
		const newStr = await req.json()
		if (!newStr) return res(ctx.status(500))
		newStr.id = createUUID()
		streams.push(newStr)

		return res(
			ctx.status(201),
			ctx.json(newStr),
		)
	}),

	/** UPDATE
	 * modifica una STREAM
	 */
	rest.post('/api/stream/:id', async (req, res, ctx) => {
		const id = req.params.id
		const newStr = await req.json()
		if (!id || !newStr) return res(ctx.status(500))

		const index = streams.findIndex(c => c.id == id)
		if (index == -1) return res(ctx.status(404))

		streams[index] = { ...streams[index], ...newStr }

		return res(
			ctx.status(200),
			ctx.json(streams[index]),
		)
	}),

	/** DELETE
	 * cancella una CONNECTION
	 */
	rest.delete('/api/stream/:id', async (req, res, ctx) => {
		const id = req.params.id
		if (!id) return res(ctx.status(500))

		const index = streams.findIndex(cnn => cnn.id == id)
		if (index == -1) return res(ctx.status(500))
		streams.splice(index, 1)

		return res(
			ctx.status(200),
		)
	}),

]

export default handlers