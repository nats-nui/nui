import connection from "./connection"
import stream from "./stream"
import consumer from "./consumer"
import keyValueEntry from "./keyValueEntry.ts"
import bucket from "./bucket"


export const handlers = [
	...connection,
	...stream,
	...consumer,
	...keyValueEntry,
	...bucket,
]
