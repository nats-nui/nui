import { buckets } from '@/mocks/data/buckets'
import { BucketConfig } from '@/types/Bucket'
import { camelToSnake, snakeToCamel } from '@/utils/object'
import { rest } from 'msw'



const handlers = [

	/** INDEX */
	rest.get('/api/connection/:connId/kv', async (req, res, ctx) => {
		const { cnnId } = req.params
		const buckets_S = camelToSnake(buckets)
		return res(
			ctx.status(200),
			ctx.json(buckets_S),
		)
	}),

	/** GET */
	rest.get('/api/connection/:connId/kv/:bucketName', async (req, res, ctx) => {
		const { cnnId, bucketName } = req.params
		const bucket = buckets.find(b => b.bucket == bucketName)
		if (!bucket) return res(ctx.status(404))
		return res(
			ctx.status(200),
			ctx.json(camelToSnake(bucket)),
		)
	}),

	/** CREATE */
	rest.post('/api/connection/:cnnId/kv', async (req, res, ctx) => {
		const bucketConfig_S = await req.json()
		if (!bucketConfig_S) return res(ctx.status(500))
		const bucketConfig: BucketConfig = snakeToCamel(bucketConfig_S)
		return res(
			ctx.status(201),
		)
	}),

]

export default handlers