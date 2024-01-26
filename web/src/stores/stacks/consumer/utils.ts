import { DISCARD, RETENTION, STORAGE, Source, StreamConfig, StreamInfo } from "@/types/Stream";


const DefaultStream: StreamInfo = {
	config: {
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
	},
	state: null,
}

export function buildNew(): StreamInfo {
	return {
		config: { ...DefaultStream.config },
		state: null,
	}
}
