import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { useStore } from "@priolo/jon"
import dayjs from "dayjs"
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
	const firstTs = dayjs(state.firstTs).format("DD/MM/YYYY HH:mm")
	const lastTs = dayjs(state.lastTs).format("DD/MM/YYYY HH:mm")

	return <Form>

		<div className="lbl-prop-title">MESSAGES</div>

		<BoxV>
			<div className="lbl-prop">COUNT</div>
			<div className="lbl-input-readonly">{state.messages}</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">BYTES</div>
			<div className="lbl-input-readonly">{state.bytes}</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">FIRST SEQ.</div>
			<div className="lbl-input-readonly">{state.firstSeq}</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">FIRST DATETIME</div>
			<div className="lbl-input-readonly">{firstTs}</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">LAST SEQ.</div>
			<div className="lbl-input-readonly">{state.lastSeq}</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">LAST DATETIME</div>
			<div className="lbl-input-readonly">{lastTs}</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">DELETED COUNT</div>
			<div className="lbl-input-readonly">{state.numDeleted}</div>
		</BoxV>


		<div className="lbl-prop-title">CONSUMERS</div>

		<BoxV>
			<div className="lbl-prop">COUNT</div>
			<div className="lbl-input-readonly">{state.consumerCount}</div>
		</BoxV>

	</Form>
}

export default ShowForm
