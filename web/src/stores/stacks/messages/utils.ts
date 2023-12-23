
export interface HistoryMessage {
	id: string
	timestamp: number
	title?: string
	body?: string
	type?: MSG_TYPE
	height?: number
}

export enum PARAMS_MESSAGES {
	CONNECTION_ID = "cid",
}

export enum MSG_FORMAT {
	JSON = "json",
	BASE64 = "base64",
	HEX = "hex",
	TEXT = "text",
}

export enum MSG_TYPE {
	MESSAGE,
	INFO,
	WARNING,
	ERROR,
}