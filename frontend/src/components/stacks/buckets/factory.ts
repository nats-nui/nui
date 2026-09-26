import { buildStore } from "@/stores/docs/utils/factory";
import { BucketConfig } from "@/types/Bucket";
import { VIEW_SIZE } from "@priolo/jack";
import { BucketStore } from "../../../stores/stacks/buckets/detail";
import { DOC_TYPE, EDIT_STATE } from "../../../types";
import { STORAGE } from "../../../types/Stream";



export function buildBucketNew(connectionId: string, allStreams: string[]) {
	if (!connectionId) { console.error("no param"); return null; }
	const store = buildStore<BucketStore>({
		type: DOC_TYPE.BUCKET,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,

		connectionId: connectionId,
		bucket: null,
	})
	return store;
}

export function buildNewConfig(): BucketConfig {
	return {
		bucket: "",
		description: "",
		maxValueSize: 0,
		history: 0,
		ttl: 0,
		maxBytes: 0,
		storage: STORAGE.MEMORY,
		replicas: 0,
		placement: null,
		republish: null,
		mirror: null,
		sources: [],
		compression: false,
		metadata: {},
	}
}
