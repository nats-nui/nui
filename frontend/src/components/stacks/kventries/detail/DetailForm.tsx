import MyEditor from "@/components/editor"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import TextInput from "@/components/input/TextInput"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



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
	const handlePayloadChange = (payload: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, payload })

	// RENDER
	const kventry = kventrySo.getKVSelect()
	if (!kventry) return null
	const inRead = kventrySa.editState == EDIT_STATE.READ

	return <Form style={{ height: "100%" }}>

		<BoxV>
			<div className="lbl-prop">KEY</div>
			<TextInput autoFocus
				value={kventry.key ?? ""}
				onChange={handleKeyChange}
				readOnly={inRead}
			/>
		</BoxV>

		<MyEditor
			ref={ref => kventrySo.state.editorRef = ref}
			value={kventrySo.getEditorText()}
			onChange={handlePayloadChange}
			format={kventrySa.format}
			readOnly={inRead}
		/>

	</Form>
}

export default DetailForm
