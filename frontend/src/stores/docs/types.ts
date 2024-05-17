
export enum DOC_TYPE {
	EMPTY = "empty",
	CONNECTIONS = "connectons",
	CONNECTION = "connecton",

	MESSAGES = "messages",
	MESSAGE = "message",
	MESSAGE_SEND = "message_send",

	STREAMS = "streams",
	STREAM = "stream",
	STREAM_MESSAGES = "stream_messages",

	CONSUMERS = "consumers",
	CONSUMER = "consumer",

	BUCKETS = "buckets",
	BUCKET = "bucket",
	KVENTRIES = "kventries",
	KVENTRY = "kventry",

	LOGS = "logs",
	ABOUT = "about",

	TEXT_EDITOR = "text_editor",
	CODE_EDITOR = "code_editor",
	HELP = "help",
	SYNC = "sync",
}

export enum DOC_ANIM {
	SHOW = "show",
	EXIT = "exit",
	DRAGGING = "dragging",
	EXITING = "exiting",
	SHOWING = "showing",
	SIZING = "iconize",
}

export enum EDIT_STATE {
	NEW,
	READ,
	EDIT,
}

export const ANIM_TIME = 200
export const ANIM_TIME_CSS = 200
