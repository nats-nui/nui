import { TimestampString } from "./global"

export interface ConsumerInfo {
	streamName: string
	name: string,
	created: TimestampString,
	config: {
		name: string,
		durableName: string,
		deliverPolicy: string,
		ackPolicy: string,
		ackWait: number,
		maxDeliver: number,
		replayPolicy: string,
		numReplicas: number
	},
	delivered: {
		consumerSeq: number,
		streamSeq: number
	},
	ackFloor: {
		consumerSeq: number,
		streamSeq: number
	},
	numAckPending: number,
	numRedelivered: number,
	numWaiting: number,
	numPending: number,
	pushBound: boolean
}