import cnnSo from "@/stores/connections";
import { buildStore } from "@/stores/docs/utils/factory";
import { BucketsState, BucketsStore } from "@/stores/stacks/buckets";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { BucketConfig, BucketState } from "@/types/Bucket";
import { STORAGE } from "@/types/Stream";
import { VIEW_SIZE } from "../../utils";
import { BucketStatus, BucketStore } from "../detail";



/** store card lista dei buckets di una connection  */
export function buildBuckets(connectionId: string) {
	const cnn = cnnSo.getById(connectionId);
	if (!cnn) { console.error("no param"); return null; }
	const bucketsStore = buildStore({
		type: DOC_TYPE.BUCKETS,
		connectionId: cnn.id,
	} as BucketsState) as BucketsStore;
	return bucketsStore;
}

/** store card dettaglio del parametro "bucket" */
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

/** store card dettaglio di un nuovo bucket */
export function buildBucketNew(connectionId: string) {
	if (!connectionId) { console.error("no param"); return null; }
	const bucketStore = buildStore({
		type: DOC_TYPE.BUCKET,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		connectionId,
		bucket: buildNewBucketState(),
	} as BucketStatus) as BucketStore;
	return bucketStore;
}



function buildNewBucketState(): BucketState {
	return {
		bucket: "",
		values: 0,
		history: 0,
		ttl: 0,
		backingStore: STORAGE.FILE,
		bytes: 0,
		compressed: false,
		config: buildNewBucketConfig(),
	}
}

function buildNewBucketConfig(): BucketConfig {
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