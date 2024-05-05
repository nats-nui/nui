import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { TextEditorState, TextEditorStore } from "..";



export function buildTextEditor(content: string) {
	const store = buildStore({
		type: DOC_TYPE.TEXT_EDITOR,
		content,
	} as TextEditorState) as TextEditorStore
	return store;
}
