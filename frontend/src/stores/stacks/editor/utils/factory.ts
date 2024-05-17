import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { TextEditorState, TextEditorStore } from "..";



export function buildTextEditor(initValue: string) {
	const store = buildStore({
		type: DOC_TYPE.TEXT_EDITOR,
		initValue,
	} as TextEditorState) as TextEditorStore
	return store;
}
