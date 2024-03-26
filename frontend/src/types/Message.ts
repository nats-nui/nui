
export enum MESSAGE_TYPE {
	NORMAL = 0,
	INFO = 1,
	WARN = 2,
}

export interface Message {
	seqNum?: number
	subject: string
	/** base64 encoded */
	payload: string
	receivedAt?: number

	// INTERNAL
	type?: MESSAGE_TYPE
}
