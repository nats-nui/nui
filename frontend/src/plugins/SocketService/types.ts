import { CNN_STATUS } from "@/types"


export interface SocketOptions {
    protocol?: string
    host?: string
    port?: string
    base?: string
}

export enum MSG_TYPE {
    /** SUBSCRIPTIONS REQUEST - client */
    SUB_REQUEST = "subscriptions_req",
    /** DISCONNECT REQUEST - client */
    DISCONNECT_REQ = "disconnect_req",
    /** NATS MESSAGE - server */
    NATS_MESSAGE = "nats_msg",
    /** CONNECTION STATUS - server */
    CNN_STATUS = "connection_status",
    /** METRICS - client*/
    METRICS_REQ = "metrics_req",
    /** METRICS - server*/
    METRICS_RESP = "metrics_resp",
    /** SUBSCRIPTION EXPIRED - server */
    SUB_EXPIRED = "subscription_expired",
    /** ERROR MESSAGE - client server */
    ERROR = "error",
}

export interface SocketMessage {
    type: MSG_TYPE
    payload: Payload
}

/** SUBSCRIPTIONS REQUEST - client */
export type PayloadSub = {
    subjects: string[]
    ttl_minutes?: number
    max_messages?: number
    session_based?: boolean
}
/** SUBSCRIPTION EXPIRED - server */
export type PayloadSubExpired = {
    subject: string
    reason: "ttl" | "max_messages" | "disconnect" | "limit"
}
/** NATS MESSAGE - server */
export type PayloadMessage = {
    headers: { [key: string]: string[] }
    subject: string
    payload: string
}
/** CONNECTION STATUS - server */
export type PayloadStatus = {
    status: CNN_STATUS
    error: string
}
/** ERROR MESSAGE - client server */
export type PayloadError = {
    error: string
}

export type PayloadMetrics = any


export type Payload = PayloadSub | PayloadSubExpired | PayloadMessage | PayloadStatus | PayloadError | PayloadMetrics
