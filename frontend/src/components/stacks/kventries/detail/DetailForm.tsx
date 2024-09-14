import EditorCode, { EditorRefProps } from "@/components/editor"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { EDIT_STATE } from "@/types"
import { TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { binaryStringToString, stringToBinaryString } from "../../../../utils/string"



interface Props {
	store?: KVEntryStore
}

const DetailForm: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)

	// HOOKs

	// HANDLER
	const handleKeyChange = (key: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, key })
	const handlePayloadChange = (payload: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, payload: stringToBinaryString(payload) })

	// RENDER
	const kventry = kventrySo.getKVSelect()
	if (!kventry) return null
	const inRead = kventrySa.editState == EDIT_STATE.READ
	const inEdit = kventrySa.editState == EDIT_STATE.EDIT
	const autoFormat = kventrySa.autoFormat
	const refEditor = (ref: EditorRefProps) => kventrySa.editorRef = ref
	const payload = binaryStringToString(kventrySo.getEditorText())

	return <div className="jack-lyt-form" style={{ height: "100%" }}>

		<div className="lyt-v">
			<div className="jack-lbl-prop">KEY</div>
			<TextInput autoFocus
				value={kventry.key ?? ""}
				onChange={handleKeyChange}
				readOnly={inRead || inEdit}
			/>
		</div>

		<EditorCode
			ref={refEditor}
			value={payload}
			onChange={handlePayloadChange}
			format={kventrySa.format}
			readOnly={inRead}
			autoFormat={autoFormat}
		/>

	</div>
}

export default DetailForm
