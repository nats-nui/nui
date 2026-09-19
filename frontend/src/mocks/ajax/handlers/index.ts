import connection from "./connection"
import messages from "./messages"
import stream from "./stream"
import consumer from "./consumer"
import kventry from "./kventry"
import bucket from "./bucket"
import about from "./about"
import subjects from "./subjects"


export const handlers = [
	...connection,
	...messages,
	...subjects,
	...stream,
	...consumer,
	...kventry,
	...bucket,
	...about,
]
