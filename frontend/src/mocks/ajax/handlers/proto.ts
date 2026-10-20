import protoSchemas from "../../data/proto"
import { rest } from "msw"

const handlers = [
	/** INDEX */
	rest.get('/api/proto', (_req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json(protoSchemas),
		)
	}),

	/** GET */
	rest.get('/api/proto/:id', (req, res, ctx) => {
		const schema = protoSchemas.find(item => item.id === req.params.id)
		if (!schema) return res(ctx.status(404))

		return res(
			ctx.status(200),
			ctx.json(schema),
		)
	}),

	/** GET CONTENT */
	rest.get('/api/proto/:id/content', (req, res, ctx) => {
		const schema = protoSchemas.find(item => item.id === req.params.id)
		if (!schema) return res(ctx.status(404))

		return res(
			ctx.status(200),
			ctx.json(schema.content),
		)
	}),
]

export default handlers