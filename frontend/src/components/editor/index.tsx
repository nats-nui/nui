import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import { getEditorLanguage } from "@/stores/stacks/message/utils"
import { MSG_FORMAT } from "@/utils/editor"
import { Editor, Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { ForwardRefRenderFunction, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react"
import { editorOptionsDefault } from "./utils"



interface Props {
	format?: MSG_FORMAT
	value?: string
	readOnly?: boolean
	/** formatta automaticamente all'avvio e su cambio FORMAT */
	autoFormat?: boolean
	className?: string

	onChange?: (value: string) => void
}

export interface EditorRefProps {
	format?: () => void
}

const EditorCodeBase: ForwardRefRenderFunction<EditorRefProps, Props> = ({
	format,
	value,
	readOnly,
	autoFormat,
	className,
	onChange,
}, ref) => {

	const formatRun = async () => {
		if (readOnly) editorRef.current.updateOptions({ readOnly: false })
		await editorRef.current.getAction('editor.action.formatDocument').run()
		if (readOnly) editorRef.current.updateOptions({ readOnly: true })
	}

	// STORE

	// HOOKs
	const editorRef = useRef<editor.IStandaloneCodeEditor>(null)
	useEffect(() => {
		if (!editorRef.current) return
		editorRef.current.updateOptions({
			readOnly
		})
	}, [readOnly])

	// HANDLER
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
		editorRef.current = editor
		editor.updateOptions(editorOptionsDefault)
		// Formatta automaticamente il JSON all'avvio
		//if (autoFormat) setTimeout(formatRun, 300)
	}
	useImperativeHandle(ref, () => ({ format: formatRun, }), [])

	// RENDER
	if (format == MSG_FORMAT.BASE64) {
		return <Base64Cmp style={{ flex: 1, overflowY: "auto" }}
			text={value}
		/>
	}
	if (format == MSG_FORMAT.HEX) {
		return <HexTable style={{ flex: 1, overflowY: "auto" }}
			text={value}
		/>
	}
	return <Editor
		className={className}
		defaultLanguage="json"
		language={getEditorLanguage(format)}
		value={value}
		theme="vs-dark"
		onMount={handleEditorDidMount}
		onChange={onChange}
		options={{ readOnly: readOnly }}
	/>
}

const EditorCode = forwardRef(EditorCodeBase)

export default EditorCode

