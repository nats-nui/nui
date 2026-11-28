import { rest } from 'msw'

const jetstream = {
	streams: [
		{
			name: "ORDERS",
			kind: "stream",
			subjects: [
				{ subject: "shop.orders.>", pattern: "shop.orders.>", kind: "pattern" },
			],
		},
	],
}

const core = {
	listen_ms: 2000,
	heard: 1,
	truncated: false,
	subjects: [
		{ subject: "shop.orders.created", count: 2 },
	],
}

const handlers = [
	rest.get('/api/connection/:cnnId/subjects/jetstream/:stream/occupied', async (req, res, ctx) => {
		return res(ctx.status(200), ctx.json({
			stream: req.params.stream,
			kind: "stream",
			subjects: [
				{ subject: "shop.orders.created", kind: "occupied", count: 12 },
				{ subject: "shop.orders.shipped", kind: "occupied", count: 4 },
			],
		}))
	}),
	rest.get('/api/connection/:cnnId/subjects/jetstream', async (req, res, ctx) => {
		return res(ctx.status(200), ctx.json(jetstream))
	}),
	rest.get('/api/connection/:cnnId/subjects/core', async (req, res, ctx) => {
		const filter = req.url.searchParams.get("filter")?.trim()
		if (!filter) return res(ctx.status(422), ctx.json({ error: "a name is required" }))
		return res(ctx.json({ ...core, filter }))
	}),
]

export default handlers
