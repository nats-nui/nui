import Accordion from "@/components/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label, { LABELS } from "@/components/format/Label"
import Quote from "@/components/format/Quote"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import EditItemRow from "@/components/rows/EditItemRow"
import EditStringRow from "@/components/rows/EditStringRow"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { buildNewSource } from "@/stores/stacks/streams/utils/factory"
import { DISCARD, RETENTION, STORAGE, Source, StreamConfig } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useRef, useState } from "react"
import ElementDialog from "../../../dialogs/ElementDialog"
import ListDialog from "../../../dialogs/ListDialog"
import EditSourceCmp from "./EditSourceCmp"
import { EDIT_STATE } from "@/types"



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




	const [elementSource, setElementSource] = useState<HTMLElement>(null)
	const [souceIndex, setSourceIndex] = useState<number>(null)
	const listRef = useRef(null)
	const handleSourceSelect = (index: number, e: React.BaseSyntheticEvent) => {
		setSourceIndex(index)
		setElementSource(e.target)
	}
	const handleSourcesChange = (sources: Source[]) => {
		config.sources = sources
		streamSo.setStream({ ...streamSa.stream })
	}
	const handleSourceChange = (source: Source) => {
		config.sources[souceIndex] = source
		streamSo.setStream({ ...streamSa.stream })
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
	const variant = streamSa.colorVar
	const allStreams = streamSa.allStreams

	return <Form>

		<BoxV>
			<Label>NAME</Label>
			<TextInput
				value={config.name}
				onChange={name => handlePropChange({ name })}
				readOnly={inRead || !inNew}
			/>
		</BoxV>

		<BoxV>
			<Label>DESCRIPTION</Label>
			<TextInput
				value={config.description}
				onChange={description => handlePropChange({ description })}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>SUBJECTS</Label>
			<EditList<string>
				items={config.subjects}
				onChangeItems={subjects => handlePropChange({ subjects })}
				variant={variant}
				readOnly={inRead}
				fnNewItem={() => "<new>"}
				RenderRow={EditStringRow}
			/>
		</BoxV>

		<BoxV>
			<Label>RETENTION</Label>
			<ListDialog
				store={streamSo}
				select={Object.values(RETENTION).indexOf(config.retention ?? RETENTION.INTEREST)}
				items={Object.values(RETENTION)}
				RenderRow={({ item }) => item}
				readOnly={inRead || !inNew}
				onSelect={index => handlePropChange({ retention: Object.values(RETENTION)[index] })}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX CONSUMERS</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxConsumers}
				onChange={maxConsumers => handlePropChange({ maxConsumers })}
				readOnly={inRead || !inNew}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX MESSAGES</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxMsgs}
				onChange={maxMsgs => handlePropChange({ maxMsgs })}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX BYTES</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxBytes}
				onChange={maxBytes => handlePropChange({ maxBytes })}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>DISCARD</Label>
			<ListDialog
				store={streamSo}
				select={Object.values(DISCARD).indexOf(config.discard ?? DISCARD.OLD)}
				items={Object.values(DISCARD)}
				RenderRow={({ item }) => item.toUpperCase()}
				readOnly={inRead}
				onSelect={index => {
					console.log(index)
					handlePropChange({ discard: Object.values(DISCARD)[index] })
				}}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX AGE</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxAge}
				onChange={maxAge => handlePropChange({ maxAge })}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX MSGS PER SUBJECT</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxMsgsPerSubject}
				onChange={maxMsgsPerSubject => handlePropChange({ maxMsgsPerSubject })}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX MSG SIZE</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxMsgSize}
				onChange={maxMsgSize => handlePropChange({ maxMsgSize })}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>STORAGE</Label>
			<ListDialog
				store={streamSo}
				select={Object.values(STORAGE).indexOf(config.storage ?? STORAGE.FILE)}
				items={Object.values(STORAGE)}
				RenderRow={({ item }) => item}
				readOnly={inRead || !inNew}
				onSelect={index => handlePropChange({ storage: Object.values(STORAGE)[index] })}
			/>
		</BoxV>

		<BoxV>
			<Label>NUM REPLICAS</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.numReplicas}
				onChange={numReplicas => handlePropChange({ numReplicas })}
				readOnly={inRead}
			/>
		</BoxV>

		<Box>
			<IconToggle
				check={config.noAck}
				onChange={noAck => handlePropChange({ noAck })}
				readOnly={inRead}
			/>
			<Label>NO ACK</Label>
		</Box>

		<BoxV>
			<Label>TEMPLATE OWNER</Label>
			<TextInput
				value={config.templateOwner}
				onChange={templateOwner => handlePropChange({ templateOwner })}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>DUPLICATE WINDOW</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.duplicateWindow}
				onChange={duplicateWindow => handlePropChange({ duplicateWindow })}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>PLACMENT</Label>
			<Quote>
				<BoxV>
					<Label type={LABELS.SUBTEXT}>NAME</Label>
					<TextInput
						value={config.templateOwner}
						onChange={templateOwner => handlePropChange({ templateOwner })}
						readOnly={inRead}
					/>
				</BoxV>
				{/* <Label type={LABELS.SUBTEXT}>TAGS</Label> */}
				{/* TAGS propr "placement.tags" */}
			</Quote>
		</BoxV>

		<BoxV>
			<Box>
				<IconToggle
					check={!!config.mirror}
					onChange={handleMirrorCheck}
					readOnly={inRead || !inNew}
				/>
				<Label type={LABELS.TEXT}>MIRROR</Label>
			</Box>
			<Accordion open={!!config.mirror}>
				<Quote>
					<BoxV>
						<Label type={LABELS.SUBTEXT}>NAME</Label>
						<ListDialog
							store={streamSo}
							select={0}
							items={allStreams}
							RenderRow={({ item }) => item}
							readOnly={inRead || !inNew}
						// onSelect={index => {
						// 	console.log(index)
						// 	handlePropChange({ discard: Object.values(DISCARD)[index] })
						// }}
						/>
						{/* <Options<string>
								value={config.mirror?.name ?? ""}
								items={["pippo", "pluto", "paperino"]}
								RenderRow={({ item }) => item}
								readOnly={readOnly}
								onSelect={name => handleMirrorPropChange({ name })}
							/> */}
					</BoxV>
					<BoxV>
						<Label type={LABELS.SUBTEXT}>START SEQUENCE</Label>
						<NumberInput
							style={{ flex: 1 }}
							value={config.mirror?.optStartSeq}
							onChange={optStartSeq => handleMirrorPropChange({ optStartSeq })}
							readOnly={inRead || !inNew}
						/>
					</BoxV>
					<BoxV>
						<Label type={LABELS.SUBTEXT}>FILTER SUBJECT</Label>
						<TextInput
							value={config.mirror?.filterSubject}
							onChange={filterSubject => handleMirrorPropChange({ filterSubject })}
							readOnly={inRead || !inNew}
						/>
					</BoxV>
				</Quote>
			</Accordion>
		</BoxV>

		<BoxV>
			<Label>SOURCES</Label>
			<EditList<Source>
				items={config.sources}
				onChangeItems={handleSourcesChange}
				onSelect={handleSourceSelect}
				readOnly={inRead}
				fnNewItem={() => buildNewSource()}
				RenderRow={(props) => <EditItemRow {...props} item={props.item?.name} />}
				ref={listRef}
			/>
			<ElementDialog
				element={elementSource}
				store={streamSo}
				width={150}
				onClose={(e) => {
					if (listRef && listRef.current.contains(e.target)) return
					setElementSource(null)
				}}
			>
				<EditSourceCmp
					source={config.sources?.[souceIndex]}
					onChange={handleSourceChange}
					allStream={allStreams}
					readOnly={inRead}
				/>
			</ElementDialog>
		</BoxV>

		<Box>
			<IconToggle
				check={config.sealed}
				onChange={sealed => handlePropChange({ sealed })}
				readOnly={inRead}
			/>
			<Label>SEALED</Label>
		</Box>

		<Box>
			<IconToggle
				check={config.denyDelete}
				onChange={denyDelete => handlePropChange({ denyDelete })}
				readOnly={inRead || !inNew}
			/>
			<Label>DENY DELETE</Label>
		</Box>

		<Box>
			<IconToggle
				check={config.denyPurge}
				onChange={denyPurge => handlePropChange({ denyPurge })}
				readOnly={inRead || !inNew}
			/>
			<Label>DENY PURGE</Label>
		</Box>

		<Box>
			<IconToggle
				check={config.allowRollupHdrs}
				onChange={allowRollupHdrs => handlePropChange({ allowRollupHdrs })}
				readOnly={inRead}
			/>
			<Label>ALLOW ROLL UP HDRS</Label>
		</Box>

		<BoxV>
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
				<Label>REPUBLISH</Label>
			</Box>
			<Accordion open={!!config.republish}>
				<Quote>
					<BoxV>
						<Label type={LABELS.SUBTEXT}>SOURCE</Label>
						<TextInput
							value={config.republish?.src}
							onChange={src => handleRepublishPropChange({ src })}
							readOnly={inRead}
						/>
					</BoxV>
					<BoxV>
						<Label type={LABELS.SUBTEXT}>DESTINATION</Label>
						<TextInput
							value={config.republish?.dest}
							onChange={dest => handleRepublishPropChange({ dest })}
							readOnly={inRead}
						/>
					</BoxV>
					<Box>
						<IconToggle
							check={config.republish?.headersOnly}
							onChange={headersOnly => handleRepublishPropChange({ headersOnly })}
							readOnly={inRead}
						/>
						<Label type={LABELS.SUBTEXT}>HEADERS ONLY</Label>
					</Box>
				</Quote>
			</Accordion>
		</BoxV>


	</Form>
}

export default EditForm

const cssList = (readOnly: boolean, variant: number): React.CSSProperties => ({
	backgroundColor: readOnly ? "rgb(0 0 0 / 50%)" : layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	color: layoutSo.state.theme.palette.var[variant].bg,
})