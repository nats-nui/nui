import { STORAGE } from "@/types/Stream";
import { randomBool, randomInt, randomItem, randomName } from "../utils";
import { BucketState } from "@/types/Bucket";


export function randomBuckets(length: number):BucketState[] {
	return Array.from({ length }, () => randomBucket())
}

export function randomBucket():BucketState {
	const bucket:BucketState = {
		bucket: randomName(10),
		values: randomInt(100, 1),
		history: randomInt(3000, 100),
		ttl: randomInt(10, 1000),
		backingStore: randomItem(Object.keys(STORAGE)),
		bytes: randomInt(100, 1000000),
		compressed: randomBool(),
	}
	return bucket
}


