
export enum MESSAGE_TYPE {
	NONE = 0,
	INFO = 1,
	WARN = 2,
}

export interface Message {
	type?: MESSAGE_TYPE
	seqNum?: number
	subject: string
	/** base64 encoded */
	payload: string
	receivedAt?: number
}
