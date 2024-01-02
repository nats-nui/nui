import connection from "./connection"
import stream from "./stream"


export const handlers = [
	...connection,
	...stream,
]
