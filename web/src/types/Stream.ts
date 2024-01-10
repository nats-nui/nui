export interface Stream {
	id?: string
	name?: string
	description?: string
	storage?: STORAGE
	subjects?: string[]
	sources?: Source[]

	policy?: POLICY
	discardPolicy?: DISCARD_POLICY
	AllowRollUps?: boolean
	AllowDeletion?: boolean
	AllowPurging?: boolean

	maxAge?: number
	maxBytes?:number
	// e altro...
}

export interface Source {
	name: string
	startSequence: number
	startTime: number
	filterSubject: string
}

export enum STORAGE {
	FILE = "file",
	MEMORY = "memory",
}

export enum POLICY {
	LIMIT="limit",
	INTEREST="interest",
	WORKQUEQUE="workqueque",
}

export enum DISCARD_POLICY {
	OLD="old",
	NEW="new",
}

export enum UM_BIT {
	BYTE = "byte",
	KBIT= "KiB",
	MBIT= "MiB",
	GBIT= "GiB",
	TBIT= "TiB",
}