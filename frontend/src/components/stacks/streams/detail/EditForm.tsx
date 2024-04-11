import Accordion from "@/components/accordion/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import Box from "@/components/format/Box"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import EditStringRow from "@/components/rows/EditStringRow"
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
import StringUpRow from "@/components/rows/StringUpRow"



interface Props {
	store?: StreamStore
}

const EditForm: FunctionComponent<Props> = ({
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
		if (check) {
			if (!config.mirror) {
				handlePropChange({
					mirror: {
						name: "",
						optStartSeq: 0,
						filterSubject: "",
					}
				})
			}
		} else {
			if (config.mirror) {
				handlePropChange({ mirror: null })
			}
		}
	}

	// RENDER
	if (streamSa.stream?.config == null) return null
	const config: StreamConfig = streamSa.stream.config
	const inRead = streamSa.editState == EDIT_STATE.READ
	const inNew = streamSa.editState == EDIT_STATE.NEW
	const allStreams = streamSa.allStreams

	return <div className="lyt-form var-dialog" style={{ marginBottom: 25 }}>

		<div className="lbl-prop-title">BASE</div>

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
			<Box>
				<IconToggle
					check={!!config.mirror}
					onChange={handleMirrorCheck}
					readOnly={inRead || !inNew}
				/>
				<div className="lbl-prop">MIRROR</div>
			</Box>
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

		<div className="lbl-prop-title">RETENTION</div>
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
		<Box>
			<IconToggle
				check={config.allowRollupHdrs}
				onChange={allowRollupHdrs => handlePropChange({ allowRollupHdrs })}
				readOnly={inRead}
			/>
			<div className="lbl-prop">ALLOW ROLL UP HDRS</div>
		</Box>
		<Box>
			<IconToggle
				check={config.denyDelete}
				onChange={denyDelete => handlePropChange({ denyDelete })}
				readOnly={inRead || !inNew}
			/>
			<div className="lbl-prop">DENY DELETE</div>
		</Box>
		<Box>
			<IconToggle
				check={config.denyPurge}
				onChange={denyPurge => handlePropChange({ denyPurge })}
				readOnly={inRead || !inNew}
			/>
			<div className="lbl-prop">DENY PURGE</div>
		</Box>


		<div className="lbl-prop-title">LIMIT</div>
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


		<div className="lbl-prop-title">PLACEMENT</div>
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


		<div className="lbl-prop-title">PUBLISH</div>
		<Box>
			<IconToggle
				check={config.noAck}
				onChange={noAck => handlePropChange({ noAck })}
				readOnly={inRead}
			/>
			<div className="lbl-prop">ALLOW NO ACK ON PUBLISH</div>
		</Box>
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
			<Box>
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
			</Box>
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
					<Box>
						<IconToggle
							check={config.republish?.headersOnly}
							onChange={headersOnly => handleRepublishPropChange({ headersOnly })}
							readOnly={inRead}
						/>
						<div className="lbl-prop">HEADERS ONLY</div>
					</Box>
				</div>
			</Accordion>
		</div>

		<div className="lbl-prop-title">SEAL</div>

		<Box>
			<IconToggle
				check={config.sealed}
				onChange={sealed => handlePropChange({ sealed })}
				readOnly={inRead}
			/>
			<div className="lbl-prop">SEALED</div>
		</Box>

		{/*<div className="lyt-v">
			<div className="lbl-prop">TEMPLATE OWNER</div>
			<TextInput
				value={config.templateOwner}
				onChange={templateOwner => handlePropChange({templateOwner})}
				readOnly={inRead}
			/>
		</div>*/}

	</div>
}

export default EditForm

