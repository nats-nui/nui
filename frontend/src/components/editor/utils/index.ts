import { editor } from "monaco-editor";


export const editorOptionsDefault: editor.IStandaloneEditorConstructionOptions = {
	//readOnly: true,
	//readOnlyMessage: "",
	//automaticLayout: true,
	wordWrap: "on",
	lineNumbers: 'off',
	glyphMargin: false,
	lineDecorationsWidth: 0,
	lineNumbersMinChars: 0,
	folding: true,
	showFoldingControls: "mouseover",
	minimap: {
		enabled: false,
	},
	tabSize: 2,
}
