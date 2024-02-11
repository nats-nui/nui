import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { StreamConsumer } from "@/types/Consumer";
import { StreamInfo } from "@/types/Stream";
import { ConsumersState, ConsumersStore } from "..";
import { ConsumerState, ConsumerStore } from "../detail";



export function buildConsumer(connectionId: string, streamName: string, consumer: StreamConsumer) {
	if (!connectionId || !streamName || !consumer) { console.error("no param"); return null; }
	const consumerStore = buildStore({
		type: DOC_TYPE.CONSUMER,
		connectionId: connectionId,
		streamName: streamName,
		consumer,
	} as ConsumerState) as ConsumerStore;
	return consumerStore;
}

export function buildConsumers(connectionId: string, stream: Partial<StreamInfo>) {
	if (!stream?.config?.name || !connectionId) { console.error("no param"); return null; }
	const consumerStore = buildStore({
		type: DOC_TYPE.CONSUMERS,
		connectionId: connectionId,
		streamName: stream.config.name,
	} as ConsumersState) as ConsumersStore;
	return consumerStore;
}
