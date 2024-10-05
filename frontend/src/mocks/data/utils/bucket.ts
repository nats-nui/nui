import { STORAGE } from "@/types/Stream";
import { randomBool, randomInt, randomItem, randomName } from "../utils";
import { BucketConfig, BucketState } from "@/types/Bucket";


export function randomBuckets(length: number): BucketState[] {
	return Array.from({ length }, () => randomBucket())
}

export function randomBucketConfig(bucket: String): BucketConfig {
	return {
		bucket: bucket,
		description: randomName(20),
		maxValueSize: randomInt(1024, 1),
	}
}

export function randomBucket(): BucketState {
	const name = randomName(10)
	const bucket: BucketState = {
		bucket: name,
		values: randomInt(100, 1),
		history: randomInt(3000, 100),
		ttl: randomInt(10, 1000),
		backingStore: randomItem(Object.keys(STORAGE)),
		bytes: randomInt(100, 1000000),
		compressed: randomBool(),
		config: randomBucketConfig(name)
	}
	return bucket
}

export function bucketStateFromConfig(bucketConfig: BucketConfig) {
	return {
		bucket: bucketConfig.bucket,
		values: 0,
		history: 0,
		ttl: bucketConfig.ttl,
		backingStore: bucketConfig.storage,
		bytes: 0,
		compressed: bucketConfig.compression,
		config: bucketConfig
	}
}
