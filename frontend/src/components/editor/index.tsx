import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import { getEditorLanguage } from "@/stores/stacks/message/utils"
import { MSG_FORMAT } from "@/utils/editor"
import { delay } from "@/utils/time"
import { Editor, Monaco } from "@monaco-editor/react"
import { diffJson, diffWords } from "diff"
import { editor, Range } from "monaco-editor"
import { forwardRef, ForwardRefRenderFunction, useEffect, useImperativeHandle, useRef } from "react"
import { editorOptionsDefault } from "./utils"



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
	const previousValueRef = useRef<string>("")
	const changeDecorationRef = useRef<editor.IEditorDecorationsCollection | null>(null)

	useEffect(() => {
		if (!editorRef.current) return
		editorRef.current.updateOptions({
			readOnly
		})
	}, [readOnly])

	useEffect(() => {
		if (!editorRef.current) return;

		(async function () {

			if (autoFormat && readOnly) {
				await delay(20)
				await formatRun()
			}

			if (!diff || format === MSG_FORMAT.HEX || format == MSG_FORMAT.BASE64) return
			const editorModel = editorRef.current.getModel();
			const valueModel = editorModel.getValue()
			const valuePrev = previousValueRef.current
			previousValueRef.current = valueModel
			if (!valuePrev || valuePrev == valueModel) return

			const changes = format == MSG_FORMAT.JSON && autoFormat ? diffJson(valuePrev, valueModel) : diffWords(valuePrev, valueModel)
			const decorations: editor.IModelDeltaDecoration[] = [];

			let index = 0;
			for (const part of changes) {
				const length = part.value.length;
				if (part.added) {
					const start = editorModel.getPositionAt(index);
					const end = editorModel.getPositionAt(index + length);
					decorations.push({
						range: new Range(start.lineNumber, start.column, end.lineNumber, end.column),
						options: { inlineClassName: 'text-change-highlight' },
					});
				}
				if (!part.removed) {
					index += length;
				}
			}

			// Create decorations collection if it doesn't exist
			if (!changeDecorationRef.current) {
				changeDecorationRef.current = editorRef.current.createDecorationsCollection()
			}
			changeDecorationRef.current.set(decorations)
		})()
	}, [value, readOnly]);

	useImperativeHandle(ref, () => ({ format: formatRun, }), [])


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
	return (
		<Editor
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
	)

}

const EditorCode = forwardRef(EditorCodeBase)

export default EditorCode

