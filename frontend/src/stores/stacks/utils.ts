export { VIEW_SIZE } from  "@priolo/jack" 



export enum VIEW_PARAMS {
	POSITION = "pos",
}

export enum VIEW_VARIANTS {
	DEFAULT = "",
	LINK = "_link",
}

export enum LOAD_MODE {
	MANUAL,
	PARENT,
	POLLING
}

export enum LOAD_STATE {
	IDLE,
	LOADING,
	ERROR
}
