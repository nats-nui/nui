import { buckets } from '@/mocks/data/buckets'
import { bucketStateFromConfig } from '@/mocks/data/utils/bucket'
import { BucketConfig, BucketState } from '@/types/Bucket'
import { camelToSnake, snakeToCamel } from '@/utils/object'
import { rest } from 'msw'



const handlers = [

	/** INDEX */
	rest.get('/api/connection/:cnnId/kv', async (req, res, ctx) => {
		const { cnnId } = req.params
		const buckets_S = camelToSnake(buckets)
		return res(
			ctx.status(200),
			ctx.json(buckets_S),
		)
	}),

	/** GET */
	rest.get('/api/connection/:cnnId/kv/:bucketName', async (req, res, ctx) => {
		const { cnnId, bucketName } = req.params
		const bucket = buckets.find(b => b.bucket == bucketName)
		if (!bucket) return res(ctx.status(404))
		return res(
			ctx.status(200),
			ctx.json(camelToSnake(bucket)),
		)
	}),

	/** DELETE */
	rest.delete('/api/connection/:cnnId/kv/:bucketName', async (req, res, ctx) => {
		const { cnnId, bucketName } = req.params
		const index = buckets.findIndex(b => b.bucket == bucketName)
		buckets.splice(index, 1)
		return res(
			ctx.status(204),
		)
	}),

	/** CREATE */
	rest.post('/api/connection/:cnnId/kv', async (req, res, ctx) => {
		const bucketConfig_S = await req.json()
		if (!bucketConfig_S) return res(ctx.status(500))
		const bucketConfig:BucketConfig = snakeToCamel(bucketConfig_S) as BucketConfig
		const bucketState:BucketState = bucketStateFromConfig(bucketConfig)
		buckets.push(bucketState)

		// return res(
		// 	ctx.status(400),
		// 	ctx.json({
		// 		error: "TITOLO ABBASTANZA LUNGO DA ESSERE PREOCCUPOANTE	http:error:500 nats: API error: code=500 err_code=10052 description=max age needs to be = 100ms etc etc etc etc etc etc"
		// 	}),
		// )
		return res(
			ctx.status(201),
			ctx.json(camelToSnake(bucketState)),
		)
	}),

]

export default handlers