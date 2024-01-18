import { POSITION_TYPE } from "@/types"
import { ViewState, ViewStore } from "../../stacks/viewBase"
import { fromID, getID } from "./factory"
import { VIEW_PARAMS } from "@/stores/stacks/utils"



/**
 * trasformo una stringa in un array di VIEWs
 * "doc1~doc2~doc3 ..."
 */
export function stringToViewsState(ser: string): ViewState[] {
	if (!ser) return []
	const docsSer = ser.split("~")
	const docs = docsSer.map(docSer => stringToViewState(docSer))
	return docs
}

/**
 * Restituisco un DOC parziale tramite una stringa
 * i carateri ammessi sono .-_~
 * "type-uuid.key1_value1-value1-value1.key2_value2.key3_value3 ..."
  */
function stringToViewState(param: string): ViewState {
	const sub = param.split(".")
	const viewState = fromID(sub[0])
	setParams(viewState, sub.slice(1))
	return viewState
}

/** inserisce in un DOC i parametri tratti dall'URL */
function setParams(view: ViewState, params: string[]): ViewState {
	return null
	// view.params = {}
	// params.forEach(param => {
	// 	// divido key e value
	// 	const [key, valuesBlock] = param.split("_")
	// 	// il value potrebbe avere un array di values
	// 	const values = valuesBlock?.split("-") ?? []
	// 	switch (key) {
	// 		case VIEW_PARAMS.POSITION:
	// 			view.position = values[0] as POSITION_TYPE
	// 			break
	// 		default:
	// 			view.params[key] = values
	// 			break
	// 	}
	// })
	// // se non è specificato il DOC è DETACHED
	// if (!view.position) view.position = POSITION_TYPE.DETACHED
	// return view
}






/**
 * data una serie di DOCs restituisco una stringa che li rappresenta
 * tipicamente usato per l'URL
 */
export function viewsToString(views: ViewStore[]): string {
	return ""
	// const viewsStr = views.reduce((acc, view) => {
	// 	if ( !view.state.serializable ) return acc
	// 	return `${acc ? `${acc}~` : ""}${viewToString(view)}`
	// }, null as string)
	// return viewsStr
}
/**
 * Stesa cosa di prima ma per un singolo DOC
 */
export function viewToString(view: ViewStore): string {
	return ""
	// let str = getID(view.state)
	// // scrivo la "position"
	// if (view.state.position && view.state.position != POSITION_TYPE.DETACHED) str += `.${VIEW_PARAMS.POSITION}_${view.state.position}`
	// // scrivo i "params"
	// str = Object.entries(view?.state.params ?? {}).reduce((acc, [name, values]) => {
	// 	if (!name || !values) return acc
	// 	if (!Array.isArray(values)) values = [values]
	// 	if (values.length == 0) return acc

	// 	const point = acc.length == 0 ? "" : "."
	// 	const valuesStr: string = values.filter((v: any) => !!v).map((v: any) => v.toString()).join("-")
	// 	if (valuesStr.length == 0) return acc
	// 	return `${acc}${point}${name}_${valuesStr}`
	// }, str)
	// return str
}
