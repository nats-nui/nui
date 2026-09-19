import { rest } from 'msw'

const jetstream = {
	streams: [
		{
			name: "ORDERS",
			kind: "stream",
			subjects: [
				{ subject: "shop.orders", pattern: "shop.orders.>", kind: "pattern" },
			],
		},
	],
}

const core = {
	filter: "shop.>",
	listen_ms: 2000,
	heard: 1,
	truncated: false,
	subjects: [
		{ subject: "shop.orders.created", count: 2 },
	],
}

const watches = new Map<string, { filter: string, session: string }>()

const handlers = [
	rest.get('/api/connection/:cnnId/subjects/last', async (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				subject: req.url.searchParams.get("subject"),
				payload: btoa("last-from-stream"),
				seq_num: 12,
				received_at: "2026-01-01T00:00:00Z",
			}),
		)
	}),
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
		const id = String(req.params.cnnId)
		const session = req.url.searchParams.get("session") ?? ""
		const filter = req.url.searchParams.get("filter")?.trim()
		if (req.url.searchParams.get("watch") == "1") {
			if (!filter) return res(ctx.status(422), ctx.json({ error: "a name is required" }))
			watches.set(id, { filter, session })
			return res(ctx.json({ ...core, filter, watching: true }))
		}
		if (filter) return res(ctx.json({ ...core, filter }))
		const watch = watches.get(id)
		return res(ctx.json(watch?.session == session ? { ...core, filter: watch.filter, watching: true } : { subjects: [] }))
	}),
	rest.delete('/api/connection/:cnnId/subjects/core', async (req, res, ctx) => {
		const id = String(req.params.cnnId)
		if (watches.get(id)?.session == (req.url.searchParams.get("session") ?? "")) watches.delete(id)
		return res(ctx.status(200), ctx.json({}))
	}),
]

export default handlers
