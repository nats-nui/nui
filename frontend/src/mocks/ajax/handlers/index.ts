import connection from "./connection"
import stream from "./stream"
import consumer from "./consumer"
import kventry from "./kventry"
import bucket from "./bucket"


export const handlers = [
	...connection,
	...stream,
	...consumer,
	...kventry,
	...bucket,
]
