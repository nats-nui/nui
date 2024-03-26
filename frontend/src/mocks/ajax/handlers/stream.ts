import { randomMessages } from '@/mocks/data/utils/stream'
import { buildNewStreamState } from '@/stores/stacks/streams/utils/factory'
import { StreamInfo } from '@/types/Stream'
import { camelToSnake, snakeToCamel } from '@/utils/object'
import { rest } from 'msw'
import streams_S from "../../data/streams"



const handlers = [

	/** INDEX */
	rest.get('/api/connection/:connId/stream_error', async (req, res, ctx) => {
		const { cnnId } = req.params
		return res(
			ctx.status(500),
			ctx.json({ error: "messaggio generico di errore" }),
		)
	}),


	/** INDEX */
	rest.get('/api/connection/:connId/stream', async (req, res, ctx) => {
		const { cnnId } = req.params
		return res(
			ctx.status(200),
			ctx.json(streams_S),
		)
	}),

	/** GET */
	rest.get('/api/connection/:connId/stream/:streamName', async (req, res, ctx) => {
		const { cnnId, streamName } = req.params
		const stream_S = streams_S.find(s => s.config.name == streamName)
		return res(
			ctx.status(200),
			ctx.json(stream_S),
		)
	}),

	/** CREATE */
	rest.post('/api/connection/:cnnId/stream', async (req, res, ctx) => {
		const streamConfig_S = await req.json()
		if (!streamConfig_S) return res(ctx.status(500))
		const streamInfo_C: StreamInfo = {
			config: snakeToCamel(streamConfig_S),
			state: buildNewStreamState()
		}
		const streamInfo_S: any = camelToSnake(streamInfo_C)
		streams_S.push(streamInfo_S)
		return res(
			ctx.status(201),
			ctx.json(streamInfo_S),
		)
	}),

	/** UPDATE */
	rest.post('/api/connection/:cnnId/stream/:name', async (req, res, ctx) => {
		const name = req.params.name
		const streamConfig_S = await req.json()
		if (!name || !streamConfig_S) return res(ctx.status(500))

		const index = streams_S.findIndex(si => si.config.name == name)
		if (index == -1) return res(ctx.status(404))

		streams_S[index] = { ...streams_S[index], config: streamConfig_S }

		return res(
			ctx.status(200),
			ctx.json(streams_S[index]),
		)
	}),

	/** DELETE */
	rest.delete('/api/connection/:cnnId/stream/:name', async (req, res, ctx) => {
		const name = req.params.name
		if (!name) return res(ctx.status(500))

		const index = streams_S.findIndex(si => si.config.name == name)
		if (index == -1) return res(ctx.status(500))
		streams_S.splice(index, 1)

		return res(
			ctx.status(200),
		)
	}),

	/** PURGE */
	rest.post('/api/connection/:cnnId/stream/:name/purge', async (req, res, ctx) => {
		const name = req.params.name
		if (!name) return res(ctx.status(500))

		const index = streams_S.findIndex(si => si.config.name == name)
		if (index == -1) return res(ctx.status(500))
		streams_S[index]?.messages?.splice(0, streams_S[index].messages.length - 1)
		return res(
			ctx.status(200),
		)
	}),

	/** MESSAGES */
	rest.get('/api/connection/:connId/stream/:strName/messages', async (req, res, ctx) => {
		const { cnnId, strName } = req.params
		const params = req.url.searchParams
		const seqStart = Number.parseInt(params.get("seq_start"))
		const interval = Number.parseInt(params.get("interval"))
		const subjects = params.getAll("subjects")
		const messages = randomMessages(seqStart, interval)
		return res(
			ctx.delay(2000),
			ctx.status(200),
			ctx.json(camelToSnake(messages)),
		)
	}),

	/** MESSAGES DELETE*/
	rest.delete('/api/connection/:connId/stream/:strName/messages/:seq', async (req, res, ctx) => {
		const { cnnId, strName, seq } = req.params
		if (!cnnId || !strName || !seq) res(ctx.status(500))
		return res(
			ctx.delay(500),
			ctx.status(200),
		)
	}),


]

export default handlers