import { BucketConfig, BucketState } from "@/types/Bucket";
import { STORAGE } from "@/types/Stream";



export function buildNewBucketState(): BucketState {
	return {
		bucket: "",
		values: 0,
		history: 0,
		ttl: 0,
		backingStore: STORAGE.FILE,
		bytes: 0,
		compressed: false,
	}
}

export function buildNewBucketConfig(): BucketConfig {
	return {
		bucket: "",
		description: "",
		maxValueSize: 0,
		history: 0,
		ttl: 0,
		maxBytes: 0,
		storage: STORAGE.FILE,
		replicas: 0,
		placement: null,
		rePublish: null,
		mirror: null,
		sources: [],
		compression: false,
	}
}
