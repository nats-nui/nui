import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { BucketConfig, BucketState } from "@/types/Bucket";
import { KVEntry } from "@/types/KVEntry";
import { STORAGE } from "@/types/Stream";
import { KVEntriesState, KVEntriesStore } from "..";
import { KVEntryState, KVEntryStore } from "../detail";



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
export function buildKVEntries(connectionId: string, bucket: BucketState) {
	if (!bucket || !connectionId) { console.error("no param"); return null; }
	const bucketsStore = buildStore({
		type: DOC_TYPE.KVENTRIES,
		connectionId: connectionId,
		bucket,
	} as KVEntriesState) as KVEntriesStore;
	return bucketsStore;
}

export function buildKVEntry(connectionId: string, bucket: Partial<BucketState>, kventry: KVEntry) {
	if (!bucket || !connectionId) { console.error("no param"); return null; }
	const store = buildStore({
		type: DOC_TYPE.KVENTRY,
		editState: EDIT_STATE.READ,
		connectionId,
		bucket,
		kventry,
	} as KVEntryState) as KVEntryStore;
	return store;
}

export function buildKVEntryNew(connectionId: string, bucket: Partial<BucketState>) {
	if (!bucket || !connectionId) { console.error("no param"); return null; }
	const store = buildStore({
		type: DOC_TYPE.KVENTRY,
		editState: EDIT_STATE.NEW,
		connectionId,
		bucket,
		kventry: { key: "", payload: "" },
	} as KVEntryState) as KVEntryStore;
	return store;
}
