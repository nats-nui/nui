import { about } from '@/mocks/data/about'
import { camelToSnake } from '@/utils/object'
import { rest } from 'msw'



const handlers = [

	/** INDEX */
	rest.get('/api/about', async (req, res, ctx) => {
		const about_S = camelToSnake(about)
		return res(
			ctx.status(200),
			ctx.json(about_S),
		)
	}),

]

export default handlers