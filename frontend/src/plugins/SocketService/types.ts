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
    /** NATS MESSAGE - server */
    NATS_MESSAGE = "nats_msg",
    /** CONNECTION STATUS - server */
    CNN_STATUS = "connection_status",
    /** METRICS - client*/
    METRICS_REQ = "metrics_req",
    /** METRICS - server*/
    METRICS_RESP = "metrics_resp",
    /** CONSUMER CLIENTS - client */
    CONSUMER_CLIENTS_REQ = "consumer_clients_req",
    /** CONSUMER CLIENTS - server */
    CONSUMER_CLIENTS_RESP = "consumer_clients_resp",
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

/** CONSUMER CLIENTS REQUEST - client */
export type PayloadConsumerClientsReq = {
    stream_name: string
    consumer_name: string
    deliver_subject: string
    filter_subject: string
}
/** CONSUMER CLIENTS RESPONSE - server */
export type PayloadConsumerClientsResp = {
    stream_name: string
    consumer_name: string
    clients: any[]
    error: string
}

export type Payload = PayloadSub | PayloadMessage | PayloadStatus | PayloadError | PayloadMetrics | PayloadConsumerClientsReq | PayloadConsumerClientsResp
