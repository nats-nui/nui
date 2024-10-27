import { buckets } from '@/mocks/data/buckets'
import { bucketStateFromConfig } from '@/mocks/data/utils/bucket'
import { BucketConfig, BucketState } from '@/types/Bucket'
import { camelToSnake, snakeToCamel } from '@/utils/object'
import { rest } from 'msw'
import keyValueEntries_S from "../../data/kventries";



const handlers = [

	/** INDEX */
	rest.get('/api/connection/:cnnId/kv', async (req, res, ctx) => {
		const { cnnId } = req.params
		const bucketsList = buckets.map(bucket => ({ ...bucket, config: null }))
		const buckets_S = camelToSnake(bucketsList)
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
		const bucketConfig: BucketConfig = snakeToCamel(bucketConfig_S)
		const bucketState: BucketState = bucketStateFromConfig(bucketConfig)
		buckets.push(bucketState)
		return res(
			ctx.status(201),
			ctx.json(camelToSnake(bucketState)),
		)
	}),

	/** UPDATE */
	rest.post('/api/connection/:cnnId/kv/:bucketName', async (req, res, ctx) => {
		const { cnnId, bucketName } = req.params
		const bucketConfig_S = await req.json()
		if (!bucketConfig_S) return res(ctx.status(500))
		const bucketConfig: BucketConfig = snakeToCamel(bucketConfig_S)
		const index = buckets.findIndex(b => b.bucket == bucketName)
		if (index == -1) return res(ctx.status(404))
		buckets[index] = { ...buckets[index], config: bucketConfig }
		return res(
			ctx.status(200),
			ctx.json(camelToSnake(buckets[index])),
		)
	}),

	/** PURGE DELETED */
	rest.post('/api/connection/:cnnId/kv/:bucketName/purge_deleted', async (req, res, ctx) => {
		keyValueEntries_S.splice(0, keyValueEntries_S.length, ...keyValueEntries_S.filter((entry) => !entry.is_deleted))
		return res(ctx.status(204))
	})

]

export default handlers