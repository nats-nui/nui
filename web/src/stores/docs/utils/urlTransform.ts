import { POSITION_TYPE } from "@/types"
import { fromID } from "."
import { PARAMS_DOC, ViewState, ViewStore } from "../docBase"



/**
 * trasformo una stringa in un array di VIEWs
 * "doc1~doc2~doc3 ..."
 */
export function docsFromString(ser: string): ViewState[] {
	if (!ser) return []
	const docsSer = ser.split("~")
	const docs = docsSer.map(docSer => docFromString(docSer))
	return docs
}

/**
 * Restituisco un DOC parziale tramite una stringa
 * i carateri ammessi sono .-_~
 * "type-uuid.key1_value1-value1-value1.key2_value2.key3_value3 ..."
  */
function docFromString(param: string): ViewState {
	const sub = param.split(".")
	const viewState = fromID(sub[0])
	setParams(viewState, sub.slice(1))
	return viewState
}

/** inserisce in un DOC i parametri tratti dall'URL */
function setParams(view: ViewState, params: string[]): ViewState {
	view.params = {}
	params.forEach(param => {
		// divido key e value
		const [key, valuesBlock] = param.split("_")
		// il value potrebbe avere un array di values
		const values = valuesBlock?.split("-") ?? []
		switch (key) {
			case PARAMS_DOC.POSITION:
				view.position = values[0] as POSITION_TYPE
				break
			default:
				view.params[key] = values
				break
		}
	})
	// se non è specificato il DOC è DETACHED
	if (!view.position) view.position = POSITION_TYPE.DETACHED
	return view
}






/**
 * data una serie di DOCs restituisco una stringa che li rappresenta
 * tipicamente usato per l'URL
 */
export function stringFromDocs(view: ViewStore[]): string {
	const viewsStr = view.reduce((acc, doc) => {
		return `${acc ? `${acc}~` : ""}${stringFromDoc(doc)}`
	}, null as string)
	return viewsStr
}
/**
 * Stesa cosa di prima ma per un singolo DOC
 */
function stringFromDoc(view: ViewStore): string {
	let str = `${view.state.type}${view.state.uuid ? `-${view.state.uuid}` : ""}`
	// scrivo la "position"
	if (view.state.position && view.state.position != POSITION_TYPE.DETACHED) str += `.${PARAMS_DOC.POSITION}_${view.state.position}`
	// scrivo i "params"
	str = Object.entries(view?.state.params ?? {}).reduce((acc, [name, values]) => {
		if (!name || !values) return acc
		if (!Array.isArray(values)) values = [values]
		if (values.length == 0) return acc

		const point = acc.length == 0 ? "" : "."
		const valuesStr: string = values.filter((v: any) => !!v).map((v: any) => v.toString()).join("-")
		if (valuesStr.length == 0) return acc
		return `${acc}${point}${name}_${valuesStr}`
	}, str)
	return str
}

