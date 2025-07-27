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

export function sortClients(clients: ConnzConnection[], sort: string, isDesc:boolean=true): ConnzConnection[] {
	if (!clients || clients.length === 0) return clients;

	return [...clients].sort((a, b) => {
		let result = 0;

		switch (sort) {
			case SORTABLE_PROPERTIES.CID:
				result = a.cid - b.cid;
				break;

			case SORTABLE_PROPERTIES.RTT:
				const rttA = parseFloat(a.rtt) || 0;
				const rttB = parseFloat(b.rtt) || 0;
				result = rttA - rttB;
				break;

			case SORTABLE_PROPERTIES.UPTIME:
				result = a.uptime.localeCompare(b.uptime);
				break;

			case SORTABLE_PROPERTIES.LAST_ACTIVITY:
				result = new Date(a.last_activity).getTime() - new Date(b.last_activity).getTime();
				break;

			case SORTABLE_PROPERTIES.IDLE_TIME:
				result = a.idle.localeCompare(b.idle);
				break;

			case SORTABLE_PROPERTIES.SUBSCRIPTIONS:
				result = a.subscriptions - b.subscriptions;
				break;

			case SORTABLE_PROPERTIES.MESSAGES_OUT:
				result = a.out_msgs - b.out_msgs;
				break;

			case SORTABLE_PROPERTIES.MESSAGES_IN:
				result = a.in_msgs - b.in_msgs;
				break;

			case SORTABLE_PROPERTIES.DATA_SIZE_OUT:
				result = a.out_bytes - b.out_bytes;
				break;

			case SORTABLE_PROPERTIES.DATA_SIZE_IN:
				result = a.in_bytes - b.in_bytes;
				break;

			case SORTABLE_PROPERTIES.PENDING_DATA:
				result = a.pending_bytes - b.pending_bytes;
				break;

			case SORTABLE_PROPERTIES.CONNECTION_START:
				result = new Date(a.start).getTime() - new Date(b.start).getTime();
				break;

			case SORTABLE_PROPERTIES.NAME:
				result = (a.name ?? "").localeCompare(b.name ?? "");
				break;

			case SORTABLE_PROPERTIES.LANGUAGE:
				result = (a.lang ?? "").localeCompare(b.lang ?? "");
				break;

			default:
				result = 0;
		}

		// Applica l'ordinamento ascendente o discendente in base a isDesc
		return isDesc ? -result : result;
	});
}
