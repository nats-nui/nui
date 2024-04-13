import { rest } from 'msw'
import connections from "../../data/connections"
import { createUUID } from '@/mocks/data/utils'



const handlers = [

	/** INDEX
	 * Preleva tutte le CONNECTION
	 */
	rest.get('/api/connection', async (_req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json(connections),
		)
	}),

	/** CREATE
	 * crea una CONNECTION
	 */
	rest.post('/api/connection', async (req, res, ctx) => {
		const newCnn = await req.json()
		if (!newCnn) return res(ctx.status(500))
		newCnn.id = createUUID()
		connections.push(newCnn)

		return res(
			ctx.delay(3000),
			ctx.status(201),
			ctx.json(newCnn),
		)
	}),

	/** UPDATE
	 * modifica una CONNECTION
	 */
	rest.post('/api/connection/:id', async (req, res, ctx) => {
		const id = req.params.id
		const newCnn = await req.json()
		if (!id || !newCnn) return res(ctx.status(500))

		const index = connections.findIndex(c => c.id == id)
		if (index == -1) return res(ctx.status(404))

		connections[index] = { ...connections[index], ...newCnn }

		return res(
			ctx.delay(3000),
			ctx.status(200),
			ctx.json(connections[index]),
		)
	}),

	/** DELETE
	 * cancella una CONNECTION
	 */
	rest.delete('/api/connection/:id', async (req, res, ctx) => {
		const id = req.params.id
		if (!id) return res(ctx.status(500))

		const index = connections.findIndex(cnn => cnn.id == id)
		if (index == -1) return res(ctx.status(500))
		connections.splice(index, 1)

		return res(
			ctx.status(200),
		)
	}),
	
]

export default handlers