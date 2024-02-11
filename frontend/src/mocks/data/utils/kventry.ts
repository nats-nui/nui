import { KVEntry, OPERATION } from "@/types/KVEntry";
import { getNextId, getNow, randomName } from "../utils";


export function randomKVEntry(): KVEntry {
	const kventry: KVEntry = {
		key: randomName(),
		payload: randomName(),
		lastUpdate: getNow(),
		operation: OPERATION.PUT,
		revision: getNextId(),
		isDeleted: false,
		history: [],
	}
	return kventry
}
