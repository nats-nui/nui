import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import { getEditorLanguage } from "@/stores/stacks/message/utils"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { Editor, Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { ForwardRefRenderFunction, forwardRef, useImperativeHandle, useMemo, useRef } from "react"



const editorOptionsDefault: editor.IStandaloneEditorConstructionOptions = {
	//readOnly: true,
	//readOnlyMessage: "",
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

interface Props {
	format?: MSG_FORMAT
	value?: string
	readOnly?: boolean
	onChange?: (value: string) => void
}
interface RefProps {
	format?: () => void
}


const MyEditor: ForwardRefRenderFunction<RefProps, Props> = ({
	format,
	value,
	readOnly,
	onChange,
}, ref) => {

	// STORE

	// HOOKs
	const editorRef = useRef<editor.IStandaloneCodeEditor>(null)
	const options: editor.IStandaloneEditorConstructionOptions = useMemo(() => ({
		...editorOptionsDefault,
		readOnly,
	}), [readOnly])

	// HANDLER
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
		editorRef.current = editor
		// // Formatta automaticamente il JSON all'avvio
		// setTimeout(() => {
		// 	editor.getAction('editor.action.formatDocument').run();
		// }, 300)
	}
	useImperativeHandle(ref, () => ({
		format: () => editorRef.current.getAction('editor.action.formatDocument').run(),
	}), [])

	// RENDER
	if (format == MSG_FORMAT.BASE64) {
		return <Base64Cmp text={value} />
	}
	if (format == MSG_FORMAT.HEX) {
		return <HexTable text={value} />
	}
	return <Editor
		//defaultLanguage="json"
		language={getEditorLanguage(format)}
		value={value}
		options={options}
		theme="vs-dark"
		onMount={handleEditorDidMount}
		onChange={onChange}
	/>


}

export default forwardRef(MyEditor)

