import cnnSo from "@/stores/connections";
import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import {
	DISCARD,
	RETENTION,
	STORAGE,
	Source,
	StreamConfig,
	StreamState as StreamEntityState,
	StreamInfo
} from "@/types/Stream";
import { VIEW_SIZE } from "@priolo/jack";
import { StreamsState, StreamsStore } from "..";
import { StreamState, StreamStore } from "../detail";
import { StreamMessagesStore } from "../messages";




export function buildStreams(connectionId: string) {
	const cnn = cnnSo.getById(connectionId);
	if (!cnn) { console.error("no param"); return null; }
	const streamsStore = buildStore({
		type: DOC_TYPE.STREAMS,
		connectionId: cnn.id,
	} as StreamsState) as StreamsStore;
	return streamsStore;
}

export function buildStream(connectionId: string, stream: StreamInfo, allStreams: string[]) {
	if (!connectionId || !stream) { console.error("no param"); return null; }
	const store = buildStore({
		type: DOC_TYPE.STREAM,
		editState: EDIT_STATE.READ,
		connectionId: connectionId,
		//stream: { config: { name: stream.config.name } },
		stream,
		allStreams,
	} as StreamState) as StreamStore;
	return store;
}

export function buildStreamNew(connectionId: string, allStreams: string[]) {
	if (!connectionId) { console.error("no param"); return null; }
	const store = buildStore({
		type: DOC_TYPE.STREAM,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		connectionId: connectionId,
		stream: buildNewStreamInfo(),
		allStreams,
	} as StreamState) as StreamStore;
	return store;
}

export function buildStreamMessages(connectionId: string, stream: Partial<StreamInfo>) {
	if (!stream?.config?.name || !connectionId) { console.error("no param"); return null; }
	const streamMessagesStore = buildStore<StreamMessagesStore>({
		type: DOC_TYPE.STREAM_MESSAGES,
		connectionId,
		stream,
	})
	return streamMessagesStore;
}

function buildNewStreamInfo(): StreamInfo {
	return {
		config: buildNewStreamConfig(),
		state: newStreamState(),
	}
}

function buildNewStreamConfig(): StreamConfig {
	return {
		name: "",
		description: "",
		subjects: [],
		retention: RETENTION.LIMIT,
		maxAge: 0,
		maxBytes: -1,
		maxConsumers: -1,
		maxMsgSize: -1,
		maxMsgs: -1,
		maxMsgsPerSubject: -1,
		discard: DISCARD.OLD,
		discardNewPerSubject: false,
		storage: STORAGE.FILE,
		numReplicas: 0,
		noAck: false,
		templateOwner: "",
		duplicateWindow: 0,
		placement: null,
		mirror: null,
		sources: <Source[]>[],
		sealed: false,
		denyDelete: false,
		denyPurge: false,
		allowRollupHdrs: false,
		republish: null,
		allowDirect: false,
		mirrorDirect: false,
		compression: "none",
		firstSeq: 0,
		subjectTransform: null,
		consumerLimits: null,
		allowMsgTtl: false,
		subjectDeleteMarkerTtl: 0,
	}
}

export function newStreamState(): StreamEntityState {
	return {
		messages: 0,
		bytes: 0,
		firstSeq: 1,
		lastSeq: 1,
		lastTs: Date.now(),
		firstTs: Date.now(),
		consumerCount: 0,
	}
}

export function newSource(): Source {
	return {
		name: "",
		domain: "",
		external: null,
		filterSubject: "",
		optStartSeq: 0,
		optStartTime: null
	}
}
