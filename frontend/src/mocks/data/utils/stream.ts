import dayjs from "dayjs";
import { randomDate, randomInt, randomName } from "../utils";
import { Message } from "@/types/Message"


export function randomStreams(length: number) {
	return Array.from({ length }, () => randomStream())
}
export function randomStream() {

	const randomState = {
		messages: randomInt(20000),
		bytes: randomInt(100000),
		first_seq: randomInt(100000),
		first_ts: randomDate().toISOString(),
		last_seq: randomInt(100000),
		last_ts: randomDate().toISOString(),
		consumer_count: randomInt(200),
		deleted: null,
		num_deleted: 0,
		num_subjects: 0,
		subjects: null
	};

	return {
		config: {
			name: randomName(),
			subjects: [randomName],
			retention: "interest",
			max_consumers: -1,
			max_msgs: -1,
			max_bytes: -1,
			discard: "old",
			max_age: 0,
			max_msgs_per_subject: -1,
			max_msg_size: -1,
			storage: "file",
			num_replicas: 1,
			duplicate_window: 120000000000,
			compression: "none",
			allow_direct: false,
			mirror_direct: false,
			consumer_limits: {}
		},
		created: randomDate().toISOString(),
		state: randomState
	};
}

export function randomMessages(start: number, interval: number): Message[] {
	if ( interval < 0 ) {
		start = start + interval
		if ( start < 0 ) return []
		interval = -interval
	}
	return Array.from({ length: interval }, (_, i) => ({
		seqNum: i + start,
		headers: {},
		subject: "subject2",
		payload: i==6
			? "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"
			: i==7 ? btoa(`{"ActivePower":{"value": 0.0}}`)
			: btoa(`payload:${i}`),
		size: 10,
		receivedAt: dayjs().add(i, "minutes").valueOf(),
	})) as Message[]
}


const streamMessages: any[] = Array.from({ length: 100 }, (_, i) => {
	return {
		seq_num: i,
		headers: [],
		subject: "subject",
		payload: btoa(`payload:${i}`),
		size: 10,
		received_at: dayjs().add(i, "minutes").format(),
	}
})



export default streamMessages