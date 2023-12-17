



export interface SocketOptions {
	protocol?: string
	host?: string
	port?: string
	base?: string
}

export enum MSG_TYPE {
	/** SUBSCRIPTIONS REQUEST - client */
	SUB_REQUEST = "subscriptions_req",
	/** NATS MESSAGE - server */
	NATS_MESSAGE = "nats_msg",
	/** CONNECTION STATUS - server */
	CNN_STATUS = "connection_status",
	/** ERROR MESSAGE - client server */
	ERROR = "error",
}

export enum CNN_STATUS {
	CONNECTED = "connected",
	RECONNECTING = "reconnecting",
	DISCONNECTED = "disconnected",
}

export interface SocketMessage {
	type: MSG_TYPE
	payload: Payload
}

/** SUBSCRIPTIONS REQUEST - client */
export type PayloadSub = { 
	subjects: string[] 
}
/** NATS MESSAGE - server */
export type PayloadMessage = {
	subject: string
	payload: string
}
/** CONNECTION STATUS - server */
export type PayloadStaus = {
	status: CNN_STATUS
}
/** ERROR MESSAGE - client server */
export type PayloadError = {
	error: string
}

export type Payload = PayloadSub | PayloadMessage | PayloadStaus | PayloadError
