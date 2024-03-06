import Button from "@/components/buttons/Button"
import IconButton from "@/components/buttons/IconButton"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import ArrowLeftIcon from "@/icons/ArrowLeftIcon"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { getEditorLanguage } from "@/stores/stacks/message/utils"
import { EDIT_STATE } from "@/types"
import { Editor, Monaco } from "@monaco-editor/react"
import { useStore } from "@priolo/jon"
import { editor } from "monaco-editor"
import { FunctionComponent, useRef } from "react"



interface Props {
	store?: KVEntryStore
}

const DetailForm: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)

	// HOOKs
	const editorRef = useRef<editor.IStandaloneCodeEditor>(null)

	// HANDLER
	const handleKeyChange = (key: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, key })
	const handlePayloadChange = (payload: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, payload })
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
		editorRef.current = editor
	}

	// RENDER
	const kventry = kventrySo.getKVSelect()
	if (!kventry) return null
	const inRead = kventrySa.editState == EDIT_STATE.READ

	return <Form style={{ flex: 1 }}>

		<BoxV>
			{/* <div className="lbl-prop">KEY</div> */}
			<TextInput autoFocus
				value={kventry.key ?? ""}
				onChange={handleKeyChange}
				readOnly={inRead}
			/>
		</BoxV>
		
		<Editor
			//defaultLanguage="json"
			language={getEditorLanguage(kventrySa.format)}
			value={kventry.payload ?? ""}
			onChange={handlePayloadChange}
			options={kventrySa.editor}
			theme="vs-dark"
			onMount={handleEditorDidMount}
		/>
	</Form>
}

export default DetailForm
