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
	startTime: number
	filterSubject: string
}

export enum STORAGE {
	FILE = "file",
	MEMORY = "memory",
	MEMORY2 = "memory2",
	MEMORY3 = "memory3",
	MEMORY4 = "memory4",
	MEMORY5 = "memory5",
	MEMORY6 = "memory6",
}

export enum POLICY {
	LIMIT="limit",
	INTEREST="interest",
	WORKQUEQUE="workqueque",
}