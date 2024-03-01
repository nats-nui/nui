

export interface StreamInfo {
	config: StreamConfig
	state?: StreamState
}

export interface StreamConfig {
	name: string 				// string, not editable
	description: string			// string, omitted if empty
	subjects: string[]			// array of strings, omitted if empty
	retention: RETENTION 		// string: "limits", "interest", or "workqueue", not editable
	maxConsumers: number 		// integer, omitted if zero, not editable
	maxMsgs: number 			// integer, omitted if zero
	maxBytes: number			// integer, omitted if zero
	discard: DISCARD 			// string: "old" or "new"
	maxAge?: number				// integer, omitted if zero
	maxMsgsPerSubject: number, 	// integer, omitted if zero
  	maxMsgSize: number, 		// integer, omitted if zero
	storage?: STORAGE			// string: "file" or "memory", not editable
	numReplicas: number, 		// integer, omitted if zero
	noAck: boolean, 			// boolean, omitted if false
	templateOwner: string, 		// string, omitted if empty
	duplicateWindow: number, 	// integer, omitted if zero
	placement: Placement		// object, omitted if null
	mirror: Mirror 				// object, omitted if null, not editable, "name" is taken from stream names
	sources: Source[]			// array of objects, omitted if empty, "name" is taken from stream names
	sealed: boolean, 			// boolean, omitted if false, read only
	denyDelete: boolean, 		// boolean, omitted if false, not editable
	denyPurge: boolean, 		// boolean, omitted if false, not editable
	allowRollupHdrs: boolean 	// boolean, omitted if false
	republish: Republish 		// object, omitted if null
	allowDirect: boolean 			// boolean, omitted if false
	mirrorDirect: boolean 		// boolean, omitted if false
}

export interface StreamState {
	// numero messaggi arrivati
    messages: number;
    // quantità in byte occupata ai messaggi
    bytes: number;
    // la prima seqNumber disponibile
    firstSeq: number;
    // Go type: time
    firstTs: any;
    // l'ultima seqNumber disponibile
    lastSeq: number;
    // Go type: time
    lastTs: any;
    // numro di CONSUMER
    consumerCount: number;
    // ???
    deleted?: number[];
    // ???
    numDeleted?: number;
    // ???
    numSubjects?: number;
    // numero di messaggi per ogni SUBJECT
    subjects?: {[key: string]: number};
}


export interface Republish {
	src: string, 				// string, omitted if empty
	dest: string, 				// string, omitted if empty
	headersOnly: false 			// boolean, omitted if false
}
export interface Mirror {
	name: string				// string, omitted if empty
	optStartSeq: number			// integer, omitted if zero
	filterSubject: string		// string, omitted if empty
}

export interface Placement {
	cluster: string				// string, omitted if empty
	tags: string[]				// array of strings, omitted if empty
}

export interface Source {
	name: string				// string, omitted if empty
	optStartSeq: number			// integer, omitted if zero
	filterSubject: string		// string, omitted if empty
	external: {					// object, omitted if null
		api: string
		deliver: string
	}
	domain: string 				// string, omitted if empty
}


export enum STORAGE {
	FILE = "file",
	MEMORY = "memory",
}
export enum RETENTION {
	LIMIT = "limits",
	INTEREST = "interest",
	WORKQUEQUE = "workqueque",
}
export enum DISCARD {
	OLD = "old",
	NEW = "new",
}
export enum UM_BIT {
	BYTE = "byte",
	KBIT = "KiB",
	MBIT = "MiB",
	GBIT = "GiB",
	TBIT = "TiB",
}