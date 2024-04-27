import Accordion from "@/components/accordion/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import EditStringRow from "@/components/rows/EditStringRow"
import StringUpRow from "@/components/rows/StringUpRow"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { DISCARD, RETENTION, STORAGE, StreamConfig } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ListDialog from "../../../dialogs/ListDialog"
import MaxBytesCmp from "../../../input/MaxBytesCmp"
import MaxNumberCmp from "../../../input/MaxNumberCmp"
import MaxTimeCmp from "../../../input/MaxTimeCmp"
import SourcesCmp from "./cmp/SourcesCmp"
import TitleAccordion from "@/components/accordion/TitleAccordion"
import { dateShow } from "@/utils/time"



interface Props {
	store?: StreamStore
}

const Form: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs

	// HANDLER
	const handlePropChange = (prop: { [name: string]: any }) => streamSo.setStreamConfig({ ...streamSa.stream.config, ...prop })
	const handleMirrorPropChange = (prop: { [name: string]: any }) => {
		const config = { ...streamSa.stream.config }
		config.mirror = { ...config.mirror, ...prop }
		streamSo.setStreamConfig(config)
	}
	const handleRepublishPropChange = (prop: { [name: string]: any }) => {
		const config = { ...streamSa.stream.config }
		config.republish = { ...config.republish, ...prop }
		streamSo.setStreamConfig(config)
	}
	const handlePlacementPropChange = (prop: { [name: string]: any }) => {
		const config = { ...streamSa.stream.config }
		config.placement = { ...config.placement, ...prop }
		streamSo.setStreamConfig(config)
	}
	const handleMirrorCheck = (check: boolean) => {
		if (check && !config.mirror) {
			handlePropChange({ mirror: { name: "", optStartSeq: 0, filterSubject: "" } })
			return
		}
		if (!check && config.mirror) {
			handlePropChange({ mirror: null })
		}
	}

	// RENDER
	if (streamSa.stream?.config == null) return null
	const config = streamSa.stream.config
	const state = streamSa.stream.state
	const firstTs = dateShow(state.firstTs)
	const lastTs = dateShow(state.lastTs)
	const inRead = streamSa.editState == EDIT_STATE.READ
	const inNew = streamSa.editState == EDIT_STATE.NEW
	const allStreams = streamSa.allStreams

	return <div className="lyt-form var-dialog" style={{ marginBottom: 25 }}>

		{inRead && (
			<TitleAccordion title="STATS">

				<div className="lyt-h-props">

					<div className="item">
						<div className="lbl-prop">COUNT</div>
						<div className="lbl-readonly">{state.messages}</div>
					</div>
					<div className="lbl-divider-v" />
					<div className="item">
						<div className="lbl-prop">BYTES</div>
						<div className="lbl-readonly">{state.bytes}</div>
					</div>
					<div className="lbl-divider-v" />
					<div className="item">
						<div className="lbl-prop">DELETED</div>
						<div className="lbl-readonly">{state.numDeleted}</div>
					</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">FIRST SEQUENCE</div>
					<div className="lbl-readonly" style={{ display: "flex" }}>
						<div style={{ flex: 1 }}>{state.firstSeq}</div>
						<div style={{ fontFamily: "monospace" }}>{firstTs}</div>
					</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">LAST SEQUENCE</div>
					<div className="lbl-readonly" style={{ display: "flex" }}>
						<div style={{ flex: 1 }}>{state.lastSeq}</div>
						<div style={{ fontFamily: "monospace" }}>{lastTs}</div>
					</div>
				</div>

				<div className="lyt-v">
					<div className="lbl-prop">CONSUMER COUNT</div>
					<div className="lbl-readonly">{state.consumerCount}</div>
				</div>

			</TitleAccordion>
		)}


		<TitleAccordion title="BASE">

			<div className="lyt-v">
				<div className="lbl-prop">NAME</div>
				<TextInput
					value={config.name}
					onChange={name => handlePropChange({ name })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">DESCRIPTION</div>
				<TextInput multiline rows={2}
					value={config.description}
					onChange={description => handlePropChange({ description })}
					readOnly={inRead}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">STORAGE</div>
				<ListDialog width={80}
					store={streamSo}
					select={Object.values(STORAGE).indexOf(config.storage ?? STORAGE.FILE)}
					items={Object.values(STORAGE)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={index => handlePropChange({ storage: Object.values(STORAGE)[index] })}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">SUBJECTS</div>
				<EditList<string>
					items={config.subjects}
					onItemsChange={subjects => handlePropChange({ subjects })}
					placeholder="ex. orders.* or telemetry.>"
					readOnly={inRead}

					onNewItem={() => ""}
					fnIsVoid={i => !i || i.trim().length == 0}
					RenderRow={EditStringRow}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">SOURCES</div>
				<SourcesCmp store={streamSo} />
			</div>

			<div className="lyt-v">
				<div className="cmp-h">
					<IconToggle
						check={!!config.mirror}
						onChange={handleMirrorCheck}
						readOnly={inRead || !inNew}
					/>
					<div className="lbl-prop">MIRROR</div>
				</div>
				<Accordion open={!!config.mirror}>
					<div className="lyt-quote">
						<div className="lyt-v">
							<div className="lbl-prop">NAME</div>
							{/* <TextInput
							value={config.mirror?.name}
							onChange={name => handleMirrorPropChange({ name })}
							readOnly={inRead || !inNew}
						/> */}
							<ListDialog width={200}
								store={streamSo}
								select={allStreams?.indexOf(config?.mirror?.name) ?? -1}
								items={allStreams}
								readOnly={inRead || !inNew}
								onSelect={index => {
									handleMirrorPropChange({ name: allStreams[index] })
								}}
							/>
						</div>
						<div className="lyt-v">
							<div className="lbl-prop">START SEQUENCE</div>
							<NumberInput
								style={{ flex: 1 }}
								value={config.mirror?.optStartSeq}
								onChange={optStartSeq => handleMirrorPropChange({ optStartSeq })}
								readOnly={inRead || !inNew}
							/>
						</div>
						<div className="lyt-v">
							<div className="lbl-prop">FILTER SUBJECT</div>
							<TextInput
								value={config.mirror?.filterSubject}
								onChange={filterSubject => handleMirrorPropChange({ filterSubject })}
								readOnly={inRead || !inNew}
							/>
						</div>
					</div>
				</Accordion>
			</div>
		</TitleAccordion>


		<TitleAccordion title="RETENTION" open={!inRead}>
			<div className="lyt-v">
				<div className="lbl-prop">POLICY</div>
				<ListDialog width={100}
					store={streamSo}
					select={Object.values(RETENTION).indexOf(config.retention ?? RETENTION.INTEREST)}
					items={Object.values(RETENTION)}
					RenderRow={StringUpRow}
					readOnly={inRead || !inNew}
					onSelect={index => handlePropChange({ retention: Object.values(RETENTION)[index] })}
				/>
			</div>
			<div className="lyt-v">
				<div className="lbl-prop">DISCARD</div>
				<ListDialog width={80}
					store={streamSo}
					select={Object.values(DISCARD).indexOf(config.discard ?? DISCARD.OLD)}
					items={Object.values(DISCARD)}
					RenderRow={StringUpRow}
					readOnly={inRead}
					onSelect={index => {
						handlePropChange({ discard: Object.values(DISCARD)[index] })
					}}
				/>
			</div>
			<div className="cmp-h">
				<IconToggle
					check={config.allowRollupHdrs}
					onChange={allowRollupHdrs => handlePropChange({ allowRollupHdrs })}
					readOnly={inRead}
				/>
				<div className="lbl-prop">ALLOW ROLL UP HDRS</div>
			</div>
			<div className="cmp-h">
				<IconToggle
					check={config.denyDelete}
					onChange={denyDelete => handlePropChange({ denyDelete })}
					readOnly={inRead || !inNew}
				/>
				<div className="lbl-prop">DENY DELETE</div>
			</div>
			<div className="cmp-h">
				<IconToggle
					check={config.denyPurge}
					onChange={denyPurge => handlePropChange({ denyPurge })}
					readOnly={inRead || !inNew}
				/>
				<div className="lbl-prop">DENY PURGE</div>
			</div>
		</TitleAccordion>


		<TitleAccordion title="LIMIT" open={!inRead}>
			<MaxTimeCmp store={streamSo}
				readOnly={inRead || !inNew}
				label="MAX AGE"
				value={config.maxAge}
				desiredDefault={0}
				onChange={maxAge => streamSo.setStreamConfig({ ...streamSa.stream.config, maxAge })}
			/>
			<MaxBytesCmp store={streamSo}
				readOnly={inRead || !inNew}
				label="MAX BYTES"
				value={config.maxBytes}
				onChange={maxBytes => streamSo.setStreamConfig({ ...streamSa.stream.config, maxBytes })}
			/>
			<MaxNumberCmp
				readOnly={inRead || !inNew}
				label="MAX CONSUMERS"
				value={config.maxConsumers}
				onChange={maxConsumers => streamSo.setStreamConfig({ ...streamSa.stream.config, maxConsumers })}
			/>
			<MaxBytesCmp store={streamSo}
				readOnly={inRead || !inNew}
				label="MAX MSG SIZE"
				value={config.maxMsgSize}
				onChange={maxMsgSize => streamSo.setStreamConfig({ ...streamSa.stream.config, maxMsgSize })}
			/>
			<MaxNumberCmp
				readOnly={inRead || !inNew}
				label="MAX MESSAGES"
				value={config.maxMsgs}
				onChange={maxMsgs => streamSo.setStreamConfig({ ...streamSa.stream.config, maxMsgs })}
			/>
			<MaxNumberCmp
				readOnly={inRead || !inNew}
				label="MAX MSGS PER SUBJECT"
				value={config.maxMsgsPerSubject}
				onChange={maxMsgsPerSubject => streamSo.setStreamConfig({ ...streamSa.stream.config, maxMsgsPerSubject })}
			/>
		</TitleAccordion>


		<TitleAccordion title="PLACEMENT" open={!inRead}>
			<div className="lyt-v">
				<div className="lbl-prop">NUM REPLICAS</div>
				<NumberInput
					style={{ flex: 1 }}
					value={config.numReplicas}
					onChange={numReplicas => handlePropChange({ numReplicas })}
					readOnly={inRead}
				/>
			</div>
			<div className="lyt-v">
				<div className="lbl-prop">CLUSTER</div>
				<div className="lyt-quote">
					<div className="lyt-v">
						<div className="lbl-prop">NAME</div>
						<TextInput
							value={config.placement?.cluster}
							onChange={cluster => handlePlacementPropChange({ cluster })}
							readOnly={inRead}
						/>
					</div>
					<div className="lyt-v">
						<div className="lbl-prop">TAGS</div>
						<EditList<string>
							items={config.placement?.tags}
							onItemsChange={tags => handlePlacementPropChange({ tags })}
							placeholder="ex. client or java"
							readOnly={inRead}
							onNewItem={() => ""}
							fnIsVoid={i => !i || i.trim().length == 0}
							RenderRow={EditStringRow}
						/>
					</div>
				</div>
			</div>
		</TitleAccordion>


		<TitleAccordion title="PUBLISH" open={!inRead}>
			<div className="cmp-h">
				<IconToggle
					check={config.noAck}
					onChange={noAck => handlePropChange({ noAck })}
					readOnly={inRead}
				/>
				<div className="lbl-prop">ALLOW NO ACK ON PUBLISH</div>
			</div>
			<div className="lyt-v">
				<div className="lbl-prop">DUPLICATE WINDOW</div>
				<NumberInput
					style={{ flex: 1 }}
					value={config.duplicateWindow}
					onChange={duplicateWindow => handlePropChange({ duplicateWindow })}
					readOnly={inRead}
				/>
			</div>
			<div className="lyt-v">
				<div className="cmp-h">
					<IconToggle
						check={!!config.republish}
						onChange={check => {
							if (check) {
								if (!config.republish) {
									handlePropChange({
										republish: {
											src: "",
											dest: "",
											headersOnly: false,
										}
									})
								}
							} else {
								if (config.republish) {
									handlePropChange({ republish: null })
								}
							}
						}}
						readOnly={inRead}
					/>
					<div className="lbl-prop">REPUBLISH</div>
				</div>
				<Accordion open={!!config.republish}>
					<div className="lyt-quote">
						<div className="lyt-v">
							<div className="lbl-prop">SOURCE</div>
							<TextInput
								value={config.republish?.src}
								onChange={src => handleRepublishPropChange({ src })}
								readOnly={inRead}
							/>
						</div>
						<div className="lyt-v">
							<div className="lbl-prop">DESTINATION</div>
							<TextInput
								value={config.republish?.dest}
								onChange={dest => handleRepublishPropChange({ dest })}
								readOnly={inRead}
							/>
						</div>
						<div className="cmp-h">
							<IconToggle
								check={config.republish?.headersOnly}
								onChange={headersOnly => handleRepublishPropChange({ headersOnly })}
								readOnly={inRead}
							/>
							<div className="lbl-prop">HEADERS ONLY</div>
						</div>
					</div>
				</Accordion>
			</div>
		</TitleAccordion>


		<TitleAccordion title="SEAL" open={!inRead}>
			<div className="cmp-h">
				<IconToggle
					check={config.sealed}
					onChange={sealed => handlePropChange({ sealed })}
					readOnly={inRead}
				/>
				<div className="lbl-prop">SEALED</div>
			</div>

			{/*<div className="lyt-v">
			<div className="lbl-prop">TEMPLATE OWNER</div>
			<TextInput
				value={config.templateOwner}
				onChange={templateOwner => handlePropChange({templateOwner})}
				readOnly={inRead}
			/>
		</div>*/}
		</TitleAccordion>

	</div>
}

export default Form

