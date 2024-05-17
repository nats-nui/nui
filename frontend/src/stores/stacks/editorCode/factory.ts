import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { EditorCodeState } from ".";



export function buildCodeEditor(code: string) {
	if (!code) { console.error("no param"); return null }
	const store = buildStore({
		type: DOC_TYPE.CODE_EDITOR,
		code,
	} as EditorCodeState)
	return store
}