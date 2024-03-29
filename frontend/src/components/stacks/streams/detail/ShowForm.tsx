import { StreamStore } from "@/stores/stacks/streams/detail"
import { dateShow } from "@/utils/time"
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
	const firstTs = dateShow(state.firstTs)
	const lastTs = dateShow(state.lastTs)

	return <div className="lyt-form">

		<div className="lbl-prop-title">MESSAGES</div>

		<div className="lyt-v">
			<div className="lbl-prop">COUNT</div>
			<div className="lbl-input-readonly">{state.messages}</div>
		</div>
		<div className="lyt-v">
			<div className="lbl-prop">BYTES</div>
			<div className="lbl-input-readonly">{state.bytes}</div>
		</div>
		<div className="lyt-v">
			<div className="lbl-prop">FIRST SEQUENCE</div>
			<div className="lbl-input-readonly" style={{ display: "flex"}}>
				<div style={{flex: 1}}>{state.firstSeq}</div>
				<div style={{fontFamily: "monospace"}}>{firstTs}</div>
			</div>
		</div>
		<div className="lyt-v">
			<div className="lbl-prop">LAST SEQUENCE</div>
			<div className="lbl-input-readonly" style={{ display: "flex"}}>
				<div style={{flex: 1}}>{state.lastSeq}</div>
				<div style={{fontFamily: "monospace"}}>{lastTs}</div>
			</div>
		</div>
		<div className="lyt-v">
			<div className="lbl-prop">DELETED COUNT</div>
			<div className="lbl-input-readonly">{state.numDeleted}</div>
		</div>

		<div className="lbl-prop-title">CONSUMERS</div>

		<div className="lyt-v">
			<div className="lbl-prop">COUNT</div>
			<div className="lbl-input-readonly">{state.consumerCount}</div>
		</div>

	</div>
}

export default ShowForm
