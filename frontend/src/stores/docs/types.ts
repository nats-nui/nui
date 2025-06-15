
export enum DOC_TYPE {
	EMPTY = "empty",
	CONNECTIONS = "connectons",
	CONNECTION = "connecton",
	CNN_METRICS = "cnn_metrics",
	CNN_LOADER = "cnn_loader",

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

	HELP = "help",
	SYNC = "sync",
	JSON_CONFIG = "json_config",
	SHORTCUT = "shortcut",
}

export enum EDIT_STATE {
	NEW,
	READ,
	EDIT,
}

export const ANIM_TIME_CSS = 200
