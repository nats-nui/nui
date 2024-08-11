import MaxBytesCmp from "@/components/input/MaxBytesCmp.tsx"
import MaxNumberCmp from "@/components/input/MaxNumberCmp.tsx"
import MaxTimeCmp from "@/components/input/MaxTimeCmp.tsx"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { EDIT_STATE } from "@/types"
import { AckPolicy, DeliverPolicy, ReplayPolicy } from "@/types/Consumer"
import { dateShow } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import EditMetadataRow from "../../../rows/EditMetadataRow"
import { DateTimeInput, EditList, EditNumberRow, EditStringRow, IconToggle, ListDialog, NumberInput, StringUpRow, TextInput, TitleAccordion } from "@priolo/jack"



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
	const handleDeliverPolicyChange = (index: number) => {
		const deliverPolicy = Object.values(DeliverPolicy)[index]
		if (deliverPolicy == DeliverPolicy.DeliverByStartSequencePolicy) {
			handlePropChange({ deliverPolicy, optStartTime: null })
			return
		}
		if (deliverPolicy == DeliverPolicy.DeliverByStartTimePolicy) {
			handlePropChange({ deliverPolicy, optStartSeq: 0 })
			return
		}
		handlePropChange({ deliverPolicy, optStartSeq: 0, optStartTime: null})
	}
	const handleMetadataChange = (tuples: [string, string][]) => {
		const metadata = tuples.reduce((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {} as { [key: string]: string });
		store.setConsumerConfig({ ...state.consumer.config, metadata })
	}
	// RENDER
	const consumer = state.consumer
	if (!consumer?.config) return null
	const inRead = state.editState == EDIT_STATE.READ
	const inNew = state.editState == EDIT_STATE.NEW

	return <div className="jack-lyt-form var-dialog">

		<TitleAccordion title="BASE">

			<div className="lyt-v">
				<div className="jack-lbl-prop">NAME</div>
				{/* <div className="jack-lbl-readonly">{consumer.name ?? "-"}</div> */}
				<TextInput
					value={consumer.config.name}
					onChange={name => handlePropChange({ name })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">DURABLE NAME</div>
				<TextInput
					value={consumer.config.durableName}
					onChange={durableName => handlePropChange({ durableName })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">DESCRIPTION</div>
				<TextInput multiline rows={2}
					value={consumer.config.description}
					onChange={description => handlePropChange({ description })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">REPLAY POLICY</div>
				<ListDialog width={80}
					store={store}
					select={Object.values(ReplayPolicy).indexOf(consumer.config.replayPolicy ?? ReplayPolicy.ReplayInstantPolicy)}
					items={Object.values(ReplayPolicy)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={index => handlePropChange({ replayPolicy: Object.values(ReplayPolicy)[index] })}
				/>
			</div>

			{inRead && (
				<div className="lyt-v">
					<div className="jack-lbl-prop">CREATION DATETIME</div>
					<div className="jack-lbl-readonly">{dateShow(consumer.created)}</div>
				</div>
			)}

		</TitleAccordion>

		{inRead && <>
			<TitleAccordion title="MESSAGES">

				<div className="lyt-v">
					<div className="jack-lbl-prop">WAITING</div>
					<div className="jack-lbl-readonly">{consumer.numWaiting ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="jack-lbl-prop">PENDING</div>
					<div className="jack-lbl-readonly">{consumer.numPending ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="jack-lbl-prop">ACKS PENDING</div>
					<div className="jack-lbl-readonly">{consumer.numAckPending ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="jack-lbl-prop">REDELIVERED</div>
					<div className="jack-lbl-readonly">{consumer.numRedelivered ?? "-"}</div>
				</div>

			</TitleAccordion>

			<TitleAccordion title="LAST DELIVERED">

				<div className="lyt-v">
					<div className="jack-lbl-prop">DATETIME</div>
					<div className="jack-lbl-readonly">{consumer.delivered?.lastActive ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="jack-lbl-prop">STREAM SEQ</div>
					<div className="jack-lbl-readonly">{consumer.delivered?.streamSeq ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="jack-lbl-prop">CONSUMER SEQ</div>
					<div className="jack-lbl-readonly">{consumer.delivered?.consumerSeq ?? "-"}</div>
				</div>

			</TitleAccordion>

			<TitleAccordion title="LAST ACKED">

				<div className="lyt-v">
					<div className="jack-lbl-prop">DATETIME</div>
					<div className="jack-lbl-readonly">{consumer.ackFloor?.lastActive ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="jack-lbl-prop">STREAM SEQ</div>
					<div className="jack-lbl-readonly">{consumer.ackFloor?.streamSeq ?? "-"}</div>
				</div>

				<div className="lyt-v">
					<div className="jack-lbl-prop">CONSUMER SEQ</div>
					<div className="jack-lbl-readonly">{consumer.ackFloor?.consumerSeq ?? "-"}</div>
				</div>

			</TitleAccordion>
		</>}



		<TitleAccordion title="DELIVERY POLICY">

			<div className="lyt-v">
				<div className="jack-lbl-prop">DELIVER POLICY</div>
				<ListDialog width={150}
					store={store}
					select={Object.values(DeliverPolicy).indexOf(consumer.config.deliverPolicy ?? DeliverPolicy.DeliverAllPolicy)}
					items={Object.values(DeliverPolicy)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={handleDeliverPolicyChange}
				/>
			</div>

			{consumer.config.deliverPolicy == DeliverPolicy.DeliverByStartSequencePolicy && (
				<div className="lyt-v">
					<div className="jack-lbl-prop">OPT START SEQ</div>
					<NumberInput
						value={consumer.config.optStartSeq}
						onChange={optStartSeq => handlePropChange({ optStartSeq })}
						readOnly={inRead || !inNew}
					/>
				</div>
			)}

			{consumer.config.deliverPolicy == DeliverPolicy.DeliverByStartTimePolicy && (
				<div className="lyt-v">
					<div className="jack-lbl-prop">OPT START TIME</div>
					<DateTimeInput
						value={consumer.config.optStartTime}
						onChange={optStartTime => handlePropChange({ optStartTime })}
					/>
				</div>
			)}

			<div className="lyt-v">
				<div className="jack-lbl-prop">FILTER SUBJECTS</div>
				<EditList<string>
					items={consumer.config.filterSubjects}
					onItemsChange={filterSubjects => handlePropChange({ filterSubjects })}
					placeholder="ex. orders.* or telemetry.>"
					readOnly={inRead}
					onNewItem={() => ""}
					fnIsVoid={i => !i || i.trim().length == 0}
					RenderRow={EditStringRow}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">FILTER SUBJECT</div>
				<TextInput
					value={consumer.config.filterSubject}
					onChange={filterSubject => handlePropChange({ filterSubject })}
					readOnly={inRead}
				/>
			</div>

		</TitleAccordion>


		<TitleAccordion title="ACK POLICY">

			<div className="lyt-v">
				<div className="jack-lbl-prop">ACK POLICY</div>
				<ListDialog width={150}
					store={store}
					select={Object.values(AckPolicy).indexOf(consumer.config.ackPolicy ?? AckPolicy.AckAllPolicy)}
					items={Object.values(AckPolicy)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={index => handlePropChange({ ackPolicy: Object.values(AckPolicy)[index] })}
				/>
			</div>

			<MaxNumberCmp
				readOnly={inRead}
				label="ACK WAIT"
				value={consumer.config.ackWait}
				desiredDefault={0}
				initDefault={1}
				onChange={ackWait => handlePropChange({ ackWait })}
			/>

			<MaxNumberCmp
				readOnly={inRead}
				label="MAX DELIVER"
				value={consumer.config.maxDeliver}
				desiredDefault={-1}
				initDefault={1}
				onChange={maxDeliver => handlePropChange({ maxDeliver })}
			/>

			<MaxNumberCmp
				readOnly={inRead || !inNew}
				label="MAX WAITING"
				value={consumer.config.maxWaiting}
				desiredDefault={0}
				initDefault={1}
				onChange={maxWaiting => handlePropChange({ maxWaiting })}
			/>

			<MaxNumberCmp
				readOnly={inRead}
				label="MAX ACK PENDING"
				value={consumer.config.maxAckPending}
				desiredDefault={0}
				initDefault={1}
				onChange={maxAckPending => handlePropChange({ maxAckPending })}
			/>

			<MaxNumberCmp
				readOnly={inRead}
				label="SAMPLE FREQ"
				value={parseInt(consumer.config.sampleFreq?.length > 0 ? consumer.config.sampleFreq : "0")}
				desiredDefault={0}
				initDefault={1}
				min={1} max={100}
				onChange={sampleFreq => handlePropChange({ sampleFreq: sampleFreq == 0 ? "" : sampleFreq.toString() })}
			/>

			<div className="lyt-v">
				<div className="jack-lbl-prop">BACKOFF</div>
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

		</TitleAccordion>


		<TitleAccordion title="PULL OPTIONS">

			<MaxNumberCmp
				readOnly={inRead}
				label="MAX REQUEST BATCH"
				value={consumer.config.maxBatch}
				desiredDefault={0}
				initDefault={1}
				onChange={maxBatch => handlePropChange({ maxBatch })}
			/>

			<MaxTimeCmp
				store={store}
				readOnly={inRead}
				label="MAX REQUEST EXPIRES"
				value={consumer.config.maxExpires}
				desiredDefault={0}
				initDefault={1}
				onChange={maxExpires => handlePropChange({ maxExpires })}
			/>

			<MaxBytesCmp
				store={store}
				readOnly={inRead}
				label="MAX REQUEST BYTES"
				value={consumer.config.maxBytes}
				desiredDefault={0}
				initDefault={1}
				onChange={maxBytes => handlePropChange({ maxBytes })}
			/>

		</TitleAccordion>



		{/*<TitleAccordion title="PUSH OPTIONS (legacy)">
			<div className="jack-lbl-prop">Read only section</div>
			<div className="lyt-v">
				<div className="jack-lbl-prop">DELIVER SUBJECT</div>
				<TextInput
					value={consumer.config.deliverSubject}
					onChange={deliverSubject => handlePropChange({ deliverSubject })}
					readOnly={true}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">DELIVER GROUP</div>
				<TextInput
					value={consumer.config.deliverGroup}
					onChange={deliverGroup => handlePropChange({ deliverGroup })}
					readOnly={true}
				/>
			</div>

			<div className="jack-cmp-h">
				<IconToggle
					check={consumer.config.flowControl}
					onChange={flowControl => handlePropChange({ flowControl })}
					readOnly={true}
				/>
				<div className="jack-lbl-prop">FLOW CONTROL</div>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">IDLE HEARTBEAT</div>
				<NumberInput
					value={consumer.config.idleHeartbeat}
					onChange={idleHeartbeat => handlePropChange({ idleHeartbeat })}
					readOnly={true}
				/>
			</div>

			<div className="jack-cmp-h">
				<IconToggle
					check={consumer.config.headersOnly}
					onChange={headersOnly => handlePropChange({ headersOnly })}
					readOnly={true}
				/>
				<div className="jack-lbl-prop">HEADERS ONLY</div>
			</div>

			<MaxNumberCmp
				readOnly={inRead}
				label="RATE LIMIT BPS"
				value={consumer.config.ackWait}
				desiredDefault={0}
				initDefault={100}
				onChange={rateLimitBps => handlePropChange({ rateLimitBps })}
			/>

		</TitleAccordion>*/}


		<TitleAccordion title="ADVANCED" style={{ marginBottom: 20 }}>

			<MaxNumberCmp
				readOnly={inRead}
				label="NUM REPLICAS"
				value={consumer.config.numReplicas}
				desiredDefault={0}
				initDefault={1}
				onChange={numReplicas => handlePropChange({ numReplicas })}
			/>

			<MaxNumberCmp
				readOnly={inRead}
				label="INACTIVE THRESHOLD"
				value={consumer.config.inactiveThreshold}
				desiredDefault={0}
				initDefault={1}
				onChange={inactiveThreshold => handlePropChange({ inactiveThreshold })}
			/>

			<div className="jack-cmp-h">
				<IconToggle
					check={consumer.config.memStorage}
					onChange={memStorage => handlePropChange({ memStorage })}
					readOnly={inRead || !inNew}
				/>
				<div className="jack-lbl-prop">MEM STORAGE</div>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">METADATA</div>
				<EditList<[string, string]>
					items={!!consumer.config.metadata ? Object.entries(consumer.config.metadata) : []}
					onItemsChange={handleMetadataChange}
					readOnly={inRead}
					placeholder="ex. 10"
					onNewItem={() => ["", ""]}
					fnIsVoid={m => !m || (m[0] == "" && m[1] == "")}
					RenderRow={EditMetadataRow}
				/>
			</div>

		</TitleAccordion>

	</div>
}

export default Form
