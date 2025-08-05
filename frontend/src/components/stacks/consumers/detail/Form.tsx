import KeyValueMap from "@/components/input/KeyValueMap.tsx"
import MaxTimeCmp from "@/components/input/MaxTimeCmp"
import ToggleMaxBytesCmp from "@/components/input/ToggleMaxBytesCmp"
import ToggleMaxNumberCmp from "@/components/input/ToggleMaxNumberCmp"
import ToggleMaxTimeCmp from "@/components/input/ToggleMaxTimeCmp"
import CloseIcon from "@/icons/CloseIcon"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { EDIT_STATE } from "@/types"
import { AckPolicy, DeliverPolicy, ReplayPolicy } from "@/types/Consumer"
import { TIME } from "@/utils/conversion"
import { dateShow } from "@/utils/time"
import { DateTimeInput, EditList, EditStringRow, IconButton, IconToggle, ListDialog, NumberInput, StringUpRow, TextInput, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"




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
		handlePropChange({ deliverPolicy, optStartSeq: 0, optStartTime: null })
	}

	const handleMetadataPropChange = (metadata: { [name: string]: any }) => {
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

			<ToggleMaxTimeCmp store={store}
				readOnly={inRead}
				label="ACK WAIT"
				value={consumer.config.ackWait}
				desiredDefault={0}
				initDefault={1}
				onChange={ackWait => handlePropChange({ ackWait })}
			/>

			<ToggleMaxNumberCmp
				readOnly={inRead}
				label="MAX DELIVER"
				value={consumer.config.maxDeliver}
				desiredDefault={-1}
				initDefault={1}
				onChange={maxDeliver => handlePropChange({ maxDeliver })}
			/>

			<ToggleMaxNumberCmp
				readOnly={inRead || !inNew}
				label="MAX WAITING"
				value={consumer.config.maxWaiting}
				desiredDefault={0}
				initDefault={1}
				onChange={maxWaiting => handlePropChange({ maxWaiting })}
			/>

			<ToggleMaxNumberCmp
				readOnly={inRead}
				label="MAX ACK PENDING"
				value={consumer.config.maxAckPending}
				desiredDefault={0}
				initDefault={1}
				onChange={maxAckPending => handlePropChange({ maxAckPending })}
			/>

			<ToggleMaxNumberCmp
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
					onItemsChange={backoff => handlePropChange({ backoff })}
					onNewItem={() => 0}
					readOnly={inRead}
					fnIsVoid={m => false }
					RenderRow={({ item, readOnly, index, onChange }) => <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
						{!readOnly && <IconButton effect onClick={() => onChange(null)}><CloseIcon /></IconButton>}
						<MaxTimeCmp key={index} autoFocus
							store={store}
							value={item}
							onChange={(value) => onChange(value)}
							inputUnit={TIME.NS}
						/>
					</div>}
				/>
			</div>

		</TitleAccordion>


		<TitleAccordion title="PULL OPTIONS">

			<ToggleMaxNumberCmp
				readOnly={inRead}
				label="MAX REQUEST BATCH"
				value={consumer.config.maxBatch}
				desiredDefault={0}
				initDefault={1}
				onChange={maxBatch => handlePropChange({ maxBatch })}
			/>

			<ToggleMaxTimeCmp
				store={store}
				readOnly={inRead}
				label="MAX REQUEST EXPIRES"
				value={consumer.config.maxExpires}
				desiredDefault={0}
				initDefault={1}
				onChange={maxExpires => handlePropChange({ maxExpires })}
			/>

			<ToggleMaxBytesCmp
				store={store}
				readOnly={inRead}
				label="MAX REQUEST BYTES"
				value={consumer.config.maxBytes}
				desiredDefault={0}
				initDefault={1}
				onChange={maxBytes => handlePropChange({ maxBytes })}
			/>

		</TitleAccordion>


		<TitleAccordion title="PAUSE">

			<div className="lyt-v">
				<div className="jack-lbl-prop">PAUSED</div>
				<div className="jack-lbl-readonly">
					{consumer.paused ? "YES" : "NO"}
				</div>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">PAUSE UNTIL</div>
				<DateTimeInput
					value={consumer.config.pauseUntil}
					onChange={pauseUntil => handlePropChange({ pauseUntil })}
					readOnly={inRead || !inNew}
				/>
			</div>

		</TitleAccordion>


		<TitleAccordion title="ADVANCED" style={{ marginBottom: 20 }}>

			<ToggleMaxNumberCmp
				readOnly={inRead}
				label="NUM REPLICAS"
				value={consumer.config.numReplicas}
				desiredDefault={0}
				initDefault={1}
				onChange={numReplicas => handlePropChange({ numReplicas })}
			/>

			<ToggleMaxNumberCmp
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
				<KeyValueMap
					items={consumer.config.metadata}
					placeholder="ex. 10"
					readOnly={inRead}
					onChange={handleMetadataPropChange}
				/>
			</div>

		</TitleAccordion>

	</div>
}

export default Form



