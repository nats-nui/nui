import { Uuid } from "@/types/global"



export enum MESSAGE_TYPE {
	INFO = "info",
	WARNING = "warn",
	ERROR = "error",
}

export interface Log {
	type?: MESSAGE_TYPE
	title?: string
	body: string
	data?: any
	targetId?: Uuid
	receivedAt?: number
}