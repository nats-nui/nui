
export enum MESSAGE_TYPE {
	SUBJECT_CHANGE = -100
}

export interface Message {
	seqNum?: number
	subject: string
	/** base64 encoded */
	payload: string
	receivedAt?: number
}
