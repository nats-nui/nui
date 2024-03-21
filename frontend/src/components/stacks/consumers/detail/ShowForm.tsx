import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { dateShow } from "@/utils/time"
import { useStore } from "@priolo/jon"
import dayjs from "dayjs"
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

			<div className="lbl-input-readonly">{consumer.name ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">DESCRIPTION</div>
			<div className="lbl-input-readonly">{consumer.config.description ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">DURABLE NAME</div>
			<div className="lbl-input-readonly">{consumer.config.durableName ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">CREATION DATETIME</div>
			<div className="lbl-input-readonly">{dateShow(consumer.created)}</div>
		</BoxV>

		<div className="lbl-prop-title">MESSAGES</div>

		<BoxV>
			<div className="lbl-prop">WAITING COUNT</div>
			<div className="lbl-input-readonly">{consumer.numWaiting ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">PENDING COUNT</div>
			<div className="lbl-input-readonly">{consumer.numPending ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">ACKS PENDING COUNT</div>
			<div className="lbl-input-readonly">{consumer.numAckPending ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">REDELIVERED COUNT</div>
			<div className="lbl-input-readonly">{consumer.numRedelivered ?? "-"}</div>
		</BoxV>

		<div className="lbl-prop-title">LAST DELIVERED</div>

		<BoxV>
			<div className="lbl-prop">DATETIME</div>
			<div className="lbl-input-readonly">{consumer.delivered?.lastActive ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">STREAM SEQ</div>
			<div className="lbl-input-readonly">{consumer.delivered?.streamSeq ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">CONSUMER SEQ</div>
			<div className="lbl-input-readonly">{consumer.delivered?.consumerSeq ?? "-"}</div>
		</BoxV>

		<div className="lbl-prop-title">LAST ACKED</div>

		<BoxV>
			<div className="lbl-prop">DATETIME</div>
			<div className="lbl-input-readonly">{consumer.ackFloor?.lastActive ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">STREAM SEQ</div>
			<div className="lbl-input-readonly">{consumer.ackFloor?.streamSeq ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">CONSUMER SEQ</div>
			<div className="lbl-input-readonly">{consumer.ackFloor?.consumerSeq ?? "-"}</div>
		</BoxV>

		<div className="lbl-prop-title">CONFIG</div>

		<BoxV>
			<div className="lbl-prop">DELIVER POLICY</div>
			<div className="lbl-input-readonly">{consumer.config.deliverPolicy ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">MAX DELIVER</div>
			<div className="lbl-input-readonly">{consumer.config.maxDeliver ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">OPT START SEQ</div>
			<div className="lbl-input-readonly">{consumer.config.optStartSeq ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">OPT START TIME</div>
			<div className="lbl-input-readonly">{consumer.config.optStartTime ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">ACK POLICY</div>
			<div className="lbl-input-readonly">{consumer.config.ackPolicy ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">ACK WAIT</div>
			<div className="lbl-input-readonly">{consumer.config.ackWait ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">MAX WAITING</div>
			<div className="lbl-input-readonly">{consumer.config.maxWaiting ?? "-"}</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">MAX ACK PENDING</div>
			<div className="lbl-input-readonly">{consumer.config.maxAckPending ?? "-"}</div>
		</BoxV>

	</Form>
}

export default ShowForm
