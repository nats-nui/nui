import { DOC_TYPE } from "@/stores/docs/types"
import { ViewState, ViewStore } from "../docBase"

export * from "./urlTransform"


/** restituisce un identificativo sringa di un DOC */
export function getID(doc: ViewStore): string {
	if ( !doc.state.type && doc.state.uuid ) return doc.state.uuid
	return `${doc.state.type}${doc.state.uuid ? `-${doc.state.uuid}` : ""}`
}
/** da un ìidentificativo stringa restituisce un DOC parziale */
export function fromID(str:string ): ViewState {
	const [type, uuid] = str.split("-") as [DOC_TYPE, string]
	return { type, uuid }
}