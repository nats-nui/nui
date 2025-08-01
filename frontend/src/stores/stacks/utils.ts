export { LOAD_STATE, VIEW_SIZE } from "@priolo/jack"
import { ColorVar } from "@priolo/jack"
import { DOC_TYPE } from "../docs/types"



export function getColorFromViewType(type: DOC_TYPE): ColorVar {
	switch (type) {
		case DOC_TYPE.MESSAGES:
		case DOC_TYPE.MESSAGE:
		case DOC_TYPE.MESSAGE_SEND:
		case DOC_TYPE.SYNC:
			return { fg: "#393939", bg: "#10F3F3" }
		case DOC_TYPE.CONSUMERS:
		case DOC_TYPE.CONSUMER:
			return { fg: "#393939", bg: "#f374e6" }
		case DOC_TYPE.CNN_LOADER:
		case DOC_TYPE.CNN_METRICS:
		case DOC_TYPE.CLIENT_METRICS:
		case DOC_TYPE.CONNECTIONS:
		case DOC_TYPE.CONNECTION:
			return { fg: "#393939", bg: "#BBFB35" }
		case DOC_TYPE.BUCKET:
		case DOC_TYPE.BUCKETS:
		case DOC_TYPE.KVENTRIES:
		case DOC_TYPE.KVENTRY:
			return { fg: "#393939", bg: "#6affab" }
		case DOC_TYPE.ABOUT:
		case DOC_TYPE.SHORTCUT:
		case DOC_TYPE.HELP:
		case DOC_TYPE.JSON_CONFIG:
		case DOC_TYPE.LOGS:
			return { fg: "#393939", bg: "#dedede" }
		case DOC_TYPE.STREAM:
		case DOC_TYPE.STREAMS:
		case DOC_TYPE.STREAM_MESSAGES:
			return { fg: "#393939", bg: "#EBFB35" }
	}
}
