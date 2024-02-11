import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import TextArea from "@/components/input/TextArea"
import TextInput from "@/components/input/TextInput"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: KVEntryStore
}

const ShowForm: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)

	// HOOKs

	// HANDLER
	const handleEntryChange = (payload: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, payload })
	const handleKeyChange = (key: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, key })

	// RENDER
	const kventry = kventrySo.getKVToShow()
	if (!kventry) return null
	const inRead = kventrySa.editState == EDIT_STATE.READ

	return <Form>

		<Label>REVISION {kventry.revision}</Label>
		
		<BoxV>
			<Label>KEY</Label>
			<TextInput
				value={kventry.key ?? ""}
				onChange={handleKeyChange}
				readOnly={inRead}
			/>
		</BoxV>
		<BoxV>
			<Label>PAYLOAD</Label>
			<TextArea
				value={kventry.payload ?? ""}
				onChange={handleEntryChange}
				readOnly={inRead}
			/>
		</BoxV>

		<div>ETC ETC </div>

	</Form>
}

export default ShowForm
