import { rest } from 'msw'
import streams_S from "../../data/streams"
import streamMessages_S from '@/mocks/data/streamMessages'
import { Message } from '@/types/Message'
import { camelToSnake, snakeToCamel } from '@/utils/object'
import { StreamInfo, StreamState } from '@/types/Stream'
import { buildNewStreamState } from '@/stores/stacks/streams/utils'



const handlers = [

	/** INDEX
	 * Preleva tutti gli STREAMS di una determinata CONNECTION
	 */
	rest.get('/api/connection/:connId/stream', async (req, res, ctx) => {
		const { cnnId } = req.params
		return res(
			ctx.status(200),
			ctx.json(streams_S),
		)
	}),

	/** CREATE */
	rest.post('/api/connection/:cnnId/stream', async (req, res, ctx) => {
		const streamConfig_S = await req.json()
		if (!streamConfig_S) return res(ctx.status(500))
		const streamInfo_C:StreamInfo = {
			config: snakeToCamel( streamConfig_S),
			state: buildNewStreamState()
		}
		const streamInfo_S:any = camelToSnake(streamInfo_C)
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

	/** MESSAGES */
	rest.get('/api/connection/:connId/stream/:strName/messages', async (req, res, ctx) => {
		const { cnnId, strName } = req.params
		const params = req.url.searchParams
		const seqStart = Number.parseInt(params.get("seq_start"))
		const interval = Number.parseInt(params.get("interval"))
		const subjects = params.getAll("subjects")

		const streamMessages_C:Message[] = snakeToCamel(streamMessages_S)
		const msgs_C = streamMessages_C.filter((msg: Message) => {
			if (Number.isNaN(seqStart) || msg.seqNum < seqStart) return false
			if ( subjects && subjects.length>0 && !subjects.includes(msg.subject)) return false
			return true
		}).slice(0, interval ?? Number.POSITIVE_INFINITY)

		return res(
			ctx.delay(1000),
			ctx.status(200),
			ctx.json(camelToSnake(msgs_C)),
		)
	}),

]

export default handlers