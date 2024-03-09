import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: StreamStore
}

const ShowForm: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs


	// HANDLER

	// RENDER
	if (!streamSa.stream?.config || !streamSa.stream?.state) return null
	const config = streamSa.stream.config
	const state = streamSa.stream.state

	return <Form>

		<div className="lbl-prop-title">MESSAGES</div>

		<BoxV>
			<div className="lbl-prop">COUNT</div>
			<Label>{state.messages}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">BYTES</div>
			<Label>{state.bytes}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">FIRST SEQ.</div>
			<Label>{state.firstSeq}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">FIRST DATETIME</div>
			<Label>{state.firstTs}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">LAST SEQ.</div>
			<Label>{state.lastSeq}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">LAST DATETIME</div>
			<Label>{state.lastTs}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">DELETED COUNT</div>
			<Label>{state.numDeleted}</Label>
		</BoxV>

		<div className="lbl-prop-title">CONSUMERS</div>

		<BoxV>
			<div className="lbl-prop">COUNT</div>
			<Label>{state.consumerCount}</Label>
		</BoxV>

	</Form>
}

export default ShowForm
