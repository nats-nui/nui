import { rest } from 'msw'
import consumers from "../../data/consumer"



const handlers = [

	/** INDEX */
	rest.get('/api/connection/:connId/stream/:name/consumers', async (req, res, ctx) => {
		const { cnnId } = req.params
		return res(
			ctx.status(200),
			ctx.json(consumers),
		)
	}),

]

export default handlers