import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: ConsumerStore
}

const ShowForm: FunctionComponent<Props> = ({
	store: consumerSo,
}) => {

	// STORE
	const consumerSa = useStore(consumerSo)

	// HOOKs

	// HANDLER

	// RENDER
	const consumer = consumerSa.consumer
	if (!consumer?.config) return null

	return <Form>

		<div className="lbl-prop-title">CONSUMER</div>

		<BoxV>
			<div className="lbl-prop">NAME</div>
			<Label>{consumer.name || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">DESCRIPTION</div>
			<Label>{consumer.description || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">DURABLE NAME</div>
			<Label>{consumer.durableName || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">CREATION DATETIME</div>
			<Label>{consumer.created || "-"}</Label>
		</BoxV>

		<div className="lbl-prop-title">MESSAGES</div>

		<BoxV>
			<div className="lbl-prop">WAITING COUNT</div>
			<Label>{consumer.numWaiting || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">PENDING COUNT</div>
			<Label>{consumer.numPending || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">ACKS PENDING COUNT</div>
			<Label>{consumer.numAckPending || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">REDELIVERED COUNT</div>
			<Label>{consumer.numRedelivered || "-"}</Label>
		</BoxV>

		<div className="lbl-prop-title">LAST DELIVERED</div>

		<BoxV>
			<div className="lbl-prop">DATETIME</div>
			<Label>{consumer.delivered?.lastActive || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">STREAM SEQ</div>
			<Label>{consumer.delivered?.stream || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">CONSUMER SEQ</div>
			<Label>{consumer.delivered?.consumer || "-"}</Label>
		</BoxV>

		<div className="lbl-prop-title">LAST ACKED</div>

		<BoxV>
			<div className="lbl-prop">DATETIME</div>
			<Label>{consumer.ackFloor?.lastActive || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">STREAM SEQ</div>
			<Label>{consumer.ackFloor?.stream || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">CONSUMER SEQ</div>
			<Label>{consumer.ackFloor?.consumer || "-"}</Label>
		</BoxV>

		<div className="lbl-prop-title">CONFIG</div>

		<BoxV>
			<div className="lbl-prop">DELIVER POLICY</div>
			<Label>{consumer.config.deliverPolicy || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">MAX DELIVER</div>
			<Label>{consumer.config.maxDeliver || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">OPT START SEQ</div>
			<Label>{consumer.config.optStartSeq || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">OPT START TIME</div>
			<Label>{consumer.config.optStartTime || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">ACK POLICY</div>
			<Label>{consumer.config.ackPolicy || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">ACK WAIT</div>
			<Label>{consumer.config.ackWait || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">MAX WAITING</div>
			<Label>{consumer.config.maxWaiting || "-"}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">MAX ACK PENDING</div>
			<Label>{consumer.config.maxAckPending || "-"}</Label>
		</BoxV>

	</Form>
}

export default ShowForm
