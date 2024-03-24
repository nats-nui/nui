import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { dateShow } from "@/utils/time"
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
	const firstTs = dateShow(state.firstTs)
	const lastTs = dateShow(state.lastTs)

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
			<div className="lbl-prop">FIRST SEQUENCE</div>
			<div className="lbl-input-readonly" style={{ display: "flex"}}>
				<div style={{flex: 1}}>{state.firstSeq}</div>
				<div style={{fontFamily: "monospace"}}>{firstTs}</div>
			</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">LAST SEQUENCE</div>
			<div className="lbl-input-readonly" style={{ display: "flex"}}>
				<div style={{flex: 1}}>{state.lastSeq}</div>
				<div style={{fontFamily: "monospace"}}>{lastTs}</div>
			</div>
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
