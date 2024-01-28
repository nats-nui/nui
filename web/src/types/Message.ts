

export interface Message {
	seqNum?: number

	headers?: string[]
	subject: string
	/** base64 encoded */
	payload: string

	size?: number
	receivedAt?: number
}
