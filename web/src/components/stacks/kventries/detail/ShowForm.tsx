import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



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

	// RENDER
	const kventry = kventrySa.kventry
	if (!kventry) return null
	
	return <Form>

		<BoxV>
			<Label>KEY</Label>
			<Label>{kventry.key}</Label>
		</BoxV>
		<BoxV>
			<Label>PAYLOAD</Label>
			<Label>{kventry.payload}</Label>
		</BoxV>

		<div>ETC ETC </div>

	</Form>
}

export default ShowForm
