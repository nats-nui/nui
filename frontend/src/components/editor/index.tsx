import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import { getEditorLanguage } from "@/stores/stacks/message/utils"
import { MSG_FORMAT } from "@/utils/editor"
import { Editor, Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { ForwardRefRenderFunction, forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { editorOptionsDefault } from "./utils"
import { calculateTextDifferences } from "./utils/textDiff"



interface Props {
	format?: MSG_FORMAT
	value?: string
	readOnly?: boolean
	/** formats automatically at startup and on FORMAT change */
	autoFormat?: boolean
	/** displays the differences */
	diff?: boolean
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
	diff,
	className,
	onChange,
}, ref) => {

	const formatRun = async () => {
		if (!editorRef.current) return
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

	useEffect(() => {
		if (autoFormat && readOnly) setTimeout(formatRun, 20)
	}, [value, readOnly]);



	//#region HIGHLIGHTING

	const previousValueRef = useRef<string>("")
	const changeDecorationRef = useRef<editor.IEditorDecorationsCollection | null>(null)

	useEffect(() => {

		// Clear any existing highlights
		changeDecorationRef.current?.clear()
		changeDecorationRef.current = null
		
		// If no diff or editor is not ready, do nothing
		if (!diff || !editorRef.current || !value || format === MSG_FORMAT.BASE64 || format === MSG_FORMAT.HEX) {
			return
		}

		const previousValue = previousValueRef.current

		// Only highlight if there was a previous value and it's different
		if (previousValue && previousValue !== value) {

			// Calculate differences and highlight changes
			const changes = calculateTextDifferences(previousValue, value)
			if (changes.length > 0) {
				const decorations = changes.map(change => ({
					range: change,
					options: {
						className: 'text-change-highlight',
						isWholeLine: false,
					}
				}))
				
				// Create decorations collection if it doesn't exist
				if (!changeDecorationRef.current) {
					changeDecorationRef.current = editorRef.current.createDecorationsCollection()
				}
				
				changeDecorationRef.current.set(decorations)
			}
		}
		// Update previous value
		previousValueRef.current = value

	}, [diff, value, format])

	//#endregion HIGHLIGHTING



	// HANDLER
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
		editorRef.current = editor
		editor.updateOptions(editorOptionsDefault)
		if (autoFormat) setTimeout(formatRun, 50)

		// // Add event listener for right-click
		// editor.onContextMenu((e) => {
		// 	const position = e.target.position;
		// 	if (!position) return;
		// 	const model = editor.getModel();
		// 	const word = model.getWordAtPosition(position);
		// 	console.log("Right click position:", position);
		// 	console.log("Word under cursor:", word);
		// 	if (word) {
		// 		const range = new monaco.Range(
		// 			position.lineNumber,
		// 			word.startColumn,
		// 			position.lineNumber,
		// 			word.endColumn
		// 		);
		// 		const clickedText = model.getValueInRange(range);
		// 		console.log("Clicked text:", clickedText);
		// 	}
		// });
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
		height={"100%"}
		defaultLanguage="json"
		language={getEditorLanguage(format)}
		value={value}
		theme="vs-dark"
		onMount={handleEditorDidMount}
		onChange={onChange}
		options={{
			readOnly,
			formatOnType: true,
			formatOnPaste: true,
		}}
	/>
}

const EditorCode = forwardRef(EditorCodeBase)

export default EditorCode

