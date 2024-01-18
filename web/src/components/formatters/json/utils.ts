
export enum COLLAPSE_TYPE {
	NULL=0,
	SHOW,
	HIDE,
	SHOW_RECURSIVE,
	HIDE_RECURSIVE,
}

export const maxStringLength = 8

export const maxDeep = 10

export const getBrackets = (value: any) => Array.isArray(value) ? ["[", "]"] : ["{", "}"]

export const getInitCollapsed = (value: any, collapsed?: COLLAPSE_TYPE) => {
	//if (collapsed == COLLAPSE_TYPE.HIDE_RECURSIVE || collapsed == COLLAPSE_TYPE.SHOW_RECURSIVE) return collapsed
	return typeof value == "string" && value.length > 8 ? COLLAPSE_TYPE.HIDE : COLLAPSE_TYPE.SHOW
}

export const inShow = (collType?: COLLAPSE_TYPE) => !collType || collType == COLLAPSE_TYPE.SHOW || collType == COLLAPSE_TYPE.SHOW_RECURSIVE

export const isPrimitive = (value: any) => ["string", "number", "bigint", "boolean", "symbol", "undefined"].includes(typeof value)