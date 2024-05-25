import TitleAccordion from "@/components/accordion/TitleAccordion"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { dateShow } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { EDIT_STATE } from "../../../../types"
import TextInput from "../../../input/TextInput"
import ListDialog from "../../../dialogs/ListDialog"
import { AckPolicy, DeliverPolicy, ReplayPolicy } from "../../../../types/Consumer"
import StringUpRow from "../../../rows/StringUpRow"
import NumberInput from "../../../input/NumberInput"
import EditList from "../../../lists/EditList"
import EditNumberRow from "../../../rows/EditNumberRow"
import IconToggle from "../../../buttons/IconToggle"



interface Props {
	store?: ConsumerStore
}

const Form: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs

	// HANDLER
	const handlePropChange = (prop: { [name: string]: any }) => store.setConsumerConfig({ ...state.consumer.config, ...prop })
	const handleBackoffChange = (backoff: number[]) => store.setConsumerConfig({ ...state.consumer.config, backoff })

	// RENDER
	const consumer = state.consumer
	if (!consumer?.config) return null
	const inRead = state.editState == EDIT_STATE.READ
	const inNew = state.editState == EDIT_STATE.NEW

	return <div className="lyt-form">

		<TitleAccordion title="BASE">

			<div className="lyt-v">
				<div className="lbl-prop">NAME</div>
				{/* <div className="lbl-readonly">{consumer.name ?? "-"}</div> */}
				<TextInput
					value={consumer.config.name}
					onChange={name => handlePropChange({ name })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">DURABLE NAME</div>
				<TextInput
					value={consumer.config.durableName}
					onChange={durableName => handlePropChange({ durableName })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">DESCRIPTION</div>
				<TextInput multiline rows={2}
					value={consumer.config.description}
					onChange={description => handlePropChange({ description })}
					readOnly={inRead}
				/>
			</div>

			{inRead && (
				<div className="lyt-v">
					<div className="lbl-prop">CREATION DATETIME</div>
					<div className="lbl-readonly">{dateShow(consumer.created)}</div>
				</div>
			)}

		</TitleAccordion>

		{inRead && <>
			<TitleAccordion title="MESSAGES">

				<div className="lyt-v">
					<div className="lbl-prop">WAITING COUNT</div>
					<div className="lbl-readonly">{consumer.numWaiting ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">PENDING COUNT</div>
					<div className="lbl-readonly">{consumer.numPending ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">ACKS PENDING COUNT</div>
					<div className="lbl-readonly">{consumer.numAckPending ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">REDELIVERED COUNT</div>
					<div className="lbl-readonly">{consumer.numRedelivered ?? "-"}</div>
				</div>

			</TitleAccordion>

			<TitleAccordion title="LAST DELIVERED">

				<div className="lyt-v">
					<div className="lbl-prop">DATETIME</div>
					<div className="lbl-readonly">{consumer.delivered?.lastActive ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">STREAM SEQ</div>
					<div className="lbl-readonly">{consumer.delivered?.streamSeq ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">CONSUMER SEQ</div>
					<div className="lbl-readonly">{consumer.delivered?.consumerSeq ?? "-"}</div>
				</div>

			</TitleAccordion>

			<TitleAccordion title="LAST ACKED">

				<div className="lyt-v">
					<div className="lbl-prop">DATETIME</div>
					<div className="lbl-readonly">{consumer.ackFloor?.lastActive ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">STREAM SEQ</div>
					<div className="lbl-readonly">{consumer.ackFloor?.streamSeq ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">CONSUMER SEQ</div>
					<div className="lbl-readonly">{consumer.ackFloor?.consumerSeq ?? "-"}</div>
				</div>

			</TitleAccordion>
		</>}

		<TitleAccordion title="CONFIG">

			<div className="lyt-v">
				<div className="lbl-prop">DELIVER POLICY</div>
				<ListDialog width={150}
					store={store}
					select={Object.values(DeliverPolicy).indexOf(consumer.config.deliverPolicy ?? DeliverPolicy.DeliverAllPolicy)}
					items={Object.values(DeliverPolicy)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={index => handlePropChange({ deliverPolicy: Object.values(DeliverPolicy)[index] })}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX DELIVER</div>
				<NumberInput
					value={consumer.config.maxDeliver}
					onChange={maxDeliver => handlePropChange({ maxDeliver })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">OPT START SEQ</div>
				<NumberInput
					value={consumer.config.optStartSeq}
					onChange={optStartSeq => handlePropChange({ optStartSeq })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">OPT START TIME</div>
				<NumberInput
					value={consumer.config.optStartTime}
					onChange={optStartTime => handlePropChange({ optStartTime })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">ACK POLICY</div>
				<ListDialog width={80}
					store={store}
					select={Object.values(AckPolicy).indexOf(consumer.config.ackPolicy ?? AckPolicy.AckAllPolicy)}
					items={Object.values(AckPolicy)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={index => handlePropChange({ ackPolicy: Object.values(AckPolicy)[index] })}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">ACK WAIT</div>
				<NumberInput
					value={consumer.config.ackWait}
					onChange={ackWait => handlePropChange({ ackWait })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX WAITING</div>
				<NumberInput
					value={consumer.config.maxWaiting}
					onChange={maxWaiting => handlePropChange({ maxWaiting })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX ACK PENDING</div>
				<NumberInput
					value={consumer.config.maxAckPending}
					onChange={maxAckPending => handlePropChange({ maxAckPending })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">BACKOFF</div>
				<EditList<number>
					items={consumer.config.backoff}
					onItemsChange={handleBackoffChange}
					readOnly={inRead}
					placeholder="ex. 10"
					onNewItem={() => 0}
					fnIsVoid={h => h == null}
					RenderRow={EditNumberRow}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">FILTER SUBJECT</div>
				<TextInput
					value={consumer.config.filterSubject}
					onChange={filterSubject => handlePropChange({ filterSubject })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">FILTER SUBJECT</div>
				<TextInput
					value={consumer.config.filterSubject}
					onChange={filterSubject => handlePropChange({ filterSubject })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">REPLAY POLICY</div>
				<ListDialog width={80}
					store={store}
					select={Object.values(ReplayPolicy).indexOf(consumer.config.replayPolicy ?? ReplayPolicy.ReplayInstantPolicy)}
					items={Object.values(ReplayPolicy)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={index => handlePropChange({ replayPolicy: Object.values(ReplayPolicy)[index] })}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">RATE LIMIT BPS</div>
				<NumberInput
					value={consumer.config.rateLimitBps}
					onChange={rateLimitBps => handlePropChange({ rateLimitBps })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">SAMPLE FREQ</div>
				<TextInput
					value={consumer.config.sampleFreq}
					onChange={sampleFreq => handlePropChange({ sampleFreq })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX WAITING</div>
				<NumberInput
					value={consumer.config.maxWaiting}
					onChange={maxWaiting => handlePropChange({ maxWaiting })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX ACK PENDING</div>
				<NumberInput
					value={consumer.config.maxAckPending}
					onChange={maxAckPending => handlePropChange({ maxAckPending })}
					readOnly={inRead}
				/>
			</div>

			<div className="cmp-h">
				<IconToggle
					check={consumer.config.flowControl}
					onChange={flowControl => handlePropChange({ flowControl })}
					readOnly={inRead}
				/>
				<div className="lbl-prop">FLOW CONTROL</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">IDLE HEARTBEAT</div>
				<NumberInput
					value={consumer.config.idleHeartbeat}
					onChange={idleHeartbeat => handlePropChange({ idleHeartbeat })}
					readOnly={inRead}
				/>
			</div>

			<div className="cmp-h">
				<IconToggle
					check={consumer.config.headersOnly}
					onChange={headersOnly => handlePropChange({ headersOnly })}
					readOnly={inRead}
				/>
				<div className="lbl-prop">HEADERS ONLY</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX BATCH</div>
				<NumberInput
					value={consumer.config.maxBatch}
					onChange={maxBatch => handlePropChange({ maxBatch })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX EXPIRES</div>
				<NumberInput
					value={consumer.config.maxExpires}
					onChange={maxExpires => handlePropChange({ maxExpires })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">MAX BYTES</div>
				<NumberInput
					value={consumer.config.maxBytes}
					onChange={maxBytes => handlePropChange({ maxBytes })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">DELIVER SUBJECT</div>
				<TextInput
					value={consumer.config.deliverSubject}
					onChange={deliverSubject => handlePropChange({ deliverSubject })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">DELIVER GROUP</div>
				<TextInput
					value={consumer.config.deliverGroup}
					onChange={deliverGroup => handlePropChange({ deliverGroup })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">INACTIVE THRESHOLD</div>
				<NumberInput
					value={consumer.config.inactiveThreshold}
					onChange={inactiveThreshold => handlePropChange({ inactiveThreshold })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">NUM REPLICAS</div>
				<NumberInput
					value={consumer.config.numReplicas}
					onChange={numReplicas => handlePropChange({ numReplicas })}
					readOnly={inRead}
				/>
			</div>

			<div className="cmp-h">
				<IconToggle
					check={consumer.config.memStorage}
					onChange={memStorage => handlePropChange({ memStorage })}
					readOnly={inRead}
				/>
				<div className="lbl-prop">MEM STORAGE</div>
			</div>

		</TitleAccordion>

	</div>
}

export default Form
