import { ConnzConnection } from "@/types/Metrics";
import { SORTABLE_PROPERTIES } from "./types";
import { parseUptimeToSeconds } from "@/utils/conversion";



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
				result = b.cid - a.cid;
				break;

			case SORTABLE_PROPERTIES.RTT:
				const rttA = parseFloat(a.rtt) || 0;
				const rttB = parseFloat(b.rtt) || 0;
				result = rttB - rttA;
				break;

			case SORTABLE_PROPERTIES.UPTIME:
				const uptimeSecondsA = parseUptimeToSeconds(a.uptime);
				const uptimeSecondsB = parseUptimeToSeconds(b.uptime);
				result = uptimeSecondsB - uptimeSecondsA;
				break;

			case SORTABLE_PROPERTIES.LAST_ACTIVITY:
				result = new Date(a.last_activity).getTime() - new Date(b.last_activity).getTime();
				break;

			case SORTABLE_PROPERTIES.IDLE_TIME:
				result = b.idle.localeCompare(a.idle);
				break;

			case SORTABLE_PROPERTIES.SUBSCRIPTIONS:
				result = b.subscriptions - a.subscriptions;
				break;

			case SORTABLE_PROPERTIES.MESSAGES_OUT:
				result = b.out_msgs - a.out_msgs;
				break;

			case SORTABLE_PROPERTIES.MESSAGES_IN:
				result = b.in_msgs - a.in_msgs;
				break;

			case SORTABLE_PROPERTIES.DATA_SIZE_OUT:
				result = b.out_bytes - a.out_bytes;
				break;

			case SORTABLE_PROPERTIES.DATA_SIZE_IN:
				result = b.in_bytes - a.in_bytes;
				break;

			case SORTABLE_PROPERTIES.PENDING_DATA:
				result = b.pending_bytes - a.pending_bytes;
				break;

			case SORTABLE_PROPERTIES.CONNECTION_START:
				result = new Date(b.start).getTime() - new Date(a.start).getTime();
				break;

			case SORTABLE_PROPERTIES.NAME:
				result = (b.name ?? "").localeCompare(a.name ?? "");
				break;

			case SORTABLE_PROPERTIES.LANGUAGE:
				result = (b.lang ?? "").localeCompare(a.lang ?? "");
				break;

			default:
				result = 0;
		}

		// Applica l'ordinamento ascendente o discendente in base a isDesc
		return isDesc ? -result : result;
	});
}
