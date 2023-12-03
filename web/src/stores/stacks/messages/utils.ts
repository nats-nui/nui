
export interface HistoryMessage {
	id: string
	timestamp: number
	title: string
	body: string
	height?: number
}

export enum PARAMS_MESSAGES {
	CONNECTION_ID = "cid",
}