import { randomDate, randomInt, randomName } from "../utils";


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


