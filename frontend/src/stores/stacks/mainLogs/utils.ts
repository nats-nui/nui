
export enum LOG_TYPE {
	INFO,
	WARNING,
	ERROR,
}

export interface Log {
	type: LOG_TYPE
	body: string
	timestamp: number
}