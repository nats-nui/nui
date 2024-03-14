import cnnSo from "@/stores/connections";
import { buildStore } from "@/stores/docs/utils/factory";
import { BucketsState, BucketsStore } from "@/stores/stacks/buckets";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { BucketConfig, BucketState } from "@/types/Bucket";
import { STORAGE } from "@/types/Stream";
import { BucketStatus, BucketStore } from "../detail";
import { VIEW_SIZE } from "../../utils";



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
		maxValueSize: -1,
		history: 0,
		ttl: 0,
		maxBytes: -1,
		storage: STORAGE.FILE,
		replicas: 0,
		placement: null,
		rePublish: null,
		mirror: null,
		sources: [],
		compression: false,
	}
}
//#endregion
//#region BUCKET



export function buildBuckets(connectionId: string) {
	const cnn = cnnSo.getById(connectionId);
	if (!cnn) { console.error("no param"); return null; }
	const bucketsStore = buildStore({
		type: DOC_TYPE.BUCKETS,
		connectionId: cnn.id,
	} as BucketsState) as BucketsStore;
	return bucketsStore;
}

export function buildBucket(connectionId: string, bucket: Partial<BucketState>) {
	if (!connectionId) { console.error("no param"); return null; }
	const bucketStore = buildStore({
		type: DOC_TYPE.BUCKET,
		editState: EDIT_STATE.READ,
		connectionId,
		bucket,
	} as BucketStatus) as BucketStore;
	return bucketStore;
}
export function buildBucketNew(connectionId: string) {
	if (!connectionId) { console.error("no param"); return null; }
	const bucketStore = buildStore({
		type: DOC_TYPE.BUCKET,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		connectionId,
		bucketConfig: buildNewBucketConfig(),
	} as BucketStatus) as BucketStore;
	return bucketStore;
}
