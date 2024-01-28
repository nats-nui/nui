import { DISCARD, RETENTION, STORAGE, Source, StreamConfig, StreamInfo, StreamState } from "@/types/Stream";



export function buildNewStreamInfo(): StreamInfo {
	return {
		config: buildNewStreamConfig(),
		state: buildNewStreamState(),
	}
}

export function buildNewStreamConfig(): StreamConfig {
	return {
		name: "",
		description: "",
		subjects: [],
		retention: RETENTION.LIMIT,
		maxConsumers: 0,
		maxMsgs: 0,
		maxBytes: 0,
		discard: DISCARD.OLD,
		maxAge: 0,
		maxMsgsPerSubject: 0,
		maxMsgSize: 0,
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
	}
}

export function buildNewStreamState(): StreamState {
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

export function buildNewSource(): Source {
	return {
		name: "",
		domain: "",
		external: {
			api: "",
			deliver: ""
		},
		filterSubject: "",
		optStartSeq: 0,
	}
}

export function normalizeForFE(stream: StreamConfig): StreamConfig {
	return {
		...buildNewStreamInfo(),
		...stream
	}
}
