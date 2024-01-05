export interface Stream {
	id?: string
	name: string
	description?: string
	storage: STORAGE
	subjects: string[]
	sources: Source[]

	policy?: POLICY
	// e altro...
}

export interface Source {
	name: string
	startSequence: number
	startTime: string
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