import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import TextArea from "@/components/input/TextArea"
import TextInput from "@/components/input/TextInput"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
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
	useEffect(() => {
		kventrySo.fetch()
	}, [])

	// HANDLER
	const handleEntryChange = (payload: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, payload })
	const handleKeyChange = (key: string) => kventrySo.setKVEntry({ ...kventrySo.state.kventry, key })

	// RENDER
	const kventry = kventrySa.kventry
	if (!kventry) return null
	const readOnly = kventrySa.readOnly

	return <Form>

		<BoxV>
			<Label>KEY</Label>
			<TextInput
				value={kventry.key ?? ""}
				onChange={handleKeyChange}
				readOnly={readOnly}
			/>
		</BoxV>
		<BoxV>
			<Label>PAYLOAD</Label>
			<TextArea
				value={kventry.payload ?? ""}
				onChange={handleEntryChange}
				readOnly={readOnly}
			/>
		</BoxV>

		<div>ETC ETC </div>

	</Form>
}

export default ShowForm
