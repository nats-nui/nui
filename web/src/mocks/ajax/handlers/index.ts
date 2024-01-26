import connection from "./connection"
import stream from "./stream"
import consumer from "./consumer"


export const handlers = [
	...connection,
	...stream,
	...consumer,
]
