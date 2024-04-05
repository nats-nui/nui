import TitleAccordion from "@/components/accordion/TitleAccordion"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { dateShow } from "@/utils/time"
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

	return <div className="lyt-form">

		<TitleAccordion title="CONSUMER">

			<div className="lyt-v">
				<div className="lbl-prop">NAME</div>
				<div className="lbl-input-readonly">{consumer.name ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">DESCRIPTION</div>
				<div className="lbl-input-readonly">{consumer.config.description ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">DURABLE NAME</div>
				<div className="lbl-input-readonly">{consumer.config.durableName ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">CREATION DATETIME</div>
				<div className="lbl-input-readonly">{dateShow(consumer.created)}</div>
			</div>

		</TitleAccordion>

		<TitleAccordion title="MESSAGES">

			<div className="lyt-v">
				<div className="lbl-prop">WAITING COUNT</div>
				<div className="lbl-input-readonly">{consumer.numWaiting ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">PENDING COUNT</div>
				<div className="lbl-input-readonly">{consumer.numPending ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">ACKS PENDING COUNT</div>
				<div className="lbl-input-readonly">{consumer.numAckPending ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">REDELIVERED COUNT</div>
				<div className="lbl-input-readonly">{consumer.numRedelivered ?? "-"}</div>
			</div>

		</TitleAccordion>

		<TitleAccordion title="LAST DELIVERED">

			<div className="lyt-v">
				<div className="lbl-prop">DATETIME</div>
				<div className="lbl-input-readonly">{consumer.delivered?.lastActive ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">STREAM SEQ</div>
				<div className="lbl-input-readonly">{consumer.delivered?.streamSeq ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">CONSUMER SEQ</div>
				<div className="lbl-input-readonly">{consumer.delivered?.consumerSeq ?? "-"}</div>
			</div>

		</TitleAccordion>

		<TitleAccordion title="LAST ACKED">

			<div className="lyt-v">
				<div className="lbl-prop">DATETIME</div>
				<div className="lbl-input-readonly">{consumer.ackFloor?.lastActive ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">STREAM SEQ</div>
				<div className="lbl-input-readonly">{consumer.ackFloor?.streamSeq ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">CONSUMER SEQ</div>
				<div className="lbl-input-readonly">{consumer.ackFloor?.consumerSeq ?? "-"}</div>
			</div>

		</TitleAccordion>

		<TitleAccordion title="CONFIG">

			<div className="lyt-v">
				<div className="lbl-prop">DELIVER POLICY</div>
				<div className="lbl-input-readonly">{consumer.config.deliverPolicy ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX DELIVER</div>
				<div className="lbl-input-readonly">{consumer.config.maxDeliver ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">OPT START SEQ</div>
				<div className="lbl-input-readonly">{consumer.config.optStartSeq ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">OPT START TIME</div>
				<div className="lbl-input-readonly">{consumer.config.optStartTime ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">ACK POLICY</div>
				<div className="lbl-input-readonly">{consumer.config.ackPolicy ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">ACK WAIT</div>
				<div className="lbl-input-readonly">{consumer.config.ackWait ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX WAITING</div>
				<div className="lbl-input-readonly">{consumer.config.maxWaiting ?? "-"}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX ACK PENDING</div>
				<div className="lbl-input-readonly">{consumer.config.maxAckPending ?? "-"}</div>
			</div>

		</TitleAccordion>

	</div>
}

export default ShowForm
