import { ConnzConnection } from "@/types/Metrics";
import { SORTABLE_PROPERTIES } from "./types";



export function filterClientsByText(clients: ConnzConnection[], text: string): ConnzConnection[] {
	if (!text || text.length < 3) return clients;
	const lowerText = text.trim().toLowerCase();
	return clients.filter(cnn => {
		if (cnn.cid.toString().includes(lowerText)) return true;
		if (cnn.name && cnn.name.toLowerCase().includes(lowerText)) return true;
		return false;
	});
}

export function sortClients(clients: ConnzConnection[], sort: string): ConnzConnection[] {
	if (!clients || clients.length === 0) return clients;

	return [...clients].sort((a, b) => {
		switch (sort) {
			case SORTABLE_PROPERTIES.CID:
				return a.cid - b.cid;

			case SORTABLE_PROPERTIES.RTT:
				const rttA = parseFloat(a.rtt) || 0;
				const rttB = parseFloat(b.rtt) || 0;
				return rttA - rttB;

			case SORTABLE_PROPERTIES.UPTIME:
				return a.uptime.localeCompare(b.uptime);

			case SORTABLE_PROPERTIES.LAST_ACTIVITY:
				return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();

			case SORTABLE_PROPERTIES.IDLE_TIME:
				return a.idle.localeCompare(b.idle);

			case SORTABLE_PROPERTIES.SUBSCRIPTIONS:
				return b.subscriptions - a.subscriptions;

			case SORTABLE_PROPERTIES.MESSAGES_OUT:
				return b.out_msgs - a.out_msgs;

			case SORTABLE_PROPERTIES.MESSAGES_IN:
				return b.in_msgs - a.in_msgs;

			case SORTABLE_PROPERTIES.DATA_SIZE_OUT:
				return b.out_bytes - a.out_bytes;

			case SORTABLE_PROPERTIES.DATA_SIZE_IN:
				return b.in_bytes - a.in_bytes;

			case SORTABLE_PROPERTIES.PENDING_DATA:
				return b.pending_bytes - a.pending_bytes;

			case SORTABLE_PROPERTIES.CONNECTION_START:
				return new Date(b.start).getTime() - new Date(a.start).getTime();

			case SORTABLE_PROPERTIES.NAME:
				return (a.name ?? "").localeCompare(b.name ?? "");

			case SORTABLE_PROPERTIES.LANGUAGE:
				return (a.lang ?? "").localeCompare(b.lang ?? "");

			default:
				return 0;
		}
	});
}
