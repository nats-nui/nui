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
import { buildNewSource } from "@/stores/stacks/streams/utils"
import { DISCARD, RETENTION, STORAGE, Source, StreamConfig } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import ElementDialog from "../../../dialogs/ElementDialog"
import EditSourceCmp from "../EditSourceCmp"
import ListDialog from "../ListDialog"



interface Props {
	store?: StreamStore
}

const ConfigForm: FunctionComponent<Props> = ({
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
	const readOnly = streamSa.readOnly
	const isNew = streamSo.isNew()
	const variant = streamSo.getColorVar()
	const allStreams = streamSa.allStreams

	return <Form>

		<BoxV>
			<Label>NAME</Label>
			<TextInput
				value={config.name}
				onChange={name => handlePropChange({ name })}
				readOnly={readOnly || !isNew}
			/>
		</BoxV>

		<BoxV>
			<Label>DESCRIPTION</Label>
			<TextInput
				value={config.description}
				onChange={description => handlePropChange({ description })}
				readOnly={readOnly}
			/>
		</BoxV>

		<BoxV>
			<Label>SUBJECTS</Label>
			<EditList<string>
				items={config.subjects}
				onChangeItems={subjects => handlePropChange({ subjects })}
				variant={variant}
				readOnly={readOnly}
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
				readOnly={readOnly || !isNew}
				onSelect={index => handlePropChange({ retention: Object.values(RETENTION)[index] })}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX CONSUMERS</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxConsumers}
				onChange={maxConsumers => handlePropChange({ maxConsumers })}
				readOnly={readOnly || !isNew}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX MESSAGES</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxMsgs}
				onChange={maxMsgs => handlePropChange({ maxMsgs })}
				readOnly={readOnly}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX BYTES</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxBytes}
				onChange={maxBytes => handlePropChange({ maxBytes })}
				readOnly={readOnly}
			/>
		</BoxV>

		<BoxV>
			<Label>DISCARD</Label>
			<ListDialog
				store={streamSo}
				select={Object.values(DISCARD).indexOf(config.discard ?? DISCARD.OLD)}
				items={Object.values(DISCARD)}
				RenderRow={({ item }) => item.toUpperCase()}
				readOnly={readOnly}
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
				readOnly={readOnly}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX MSGS PER SUBJECT</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxMsgsPerSubject}
				onChange={maxMsgsPerSubject => handlePropChange({ maxMsgsPerSubject })}
				readOnly={readOnly}
			/>
		</BoxV>

		<BoxV>
			<Label>MAX MSG SIZE</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.maxMsgSize}
				onChange={maxMsgSize => handlePropChange({ maxMsgSize })}
				readOnly={readOnly}
			/>
		</BoxV>

		<BoxV>
			<Label>STORAGE</Label>
			<ListDialog
				store={streamSo}
				select={Object.values(STORAGE).indexOf(config.storage ?? STORAGE.FILE)}
				items={Object.values(STORAGE)}
				RenderRow={({ item }) => item}
				readOnly={readOnly || !isNew}
				onSelect={index => handlePropChange({ storage: Object.values(STORAGE)[index] })}
			/>
		</BoxV>

		<BoxV>
			<Label>NUM REPLICAS</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.numReplicas}
				onChange={numReplicas => handlePropChange({ numReplicas })}
				readOnly={readOnly}
			/>
		</BoxV>

		<Box>
			<IconToggle
				check={config.noAck}
				onChange={noAck => handlePropChange({ noAck })}
				readOnly={readOnly}
			/>
			<Label>NO ACK</Label>
		</Box>

		<BoxV>
			<Label>TEMPLATE OWNER</Label>
			<TextInput
				value={config.templateOwner}
				onChange={templateOwner => handlePropChange({ templateOwner })}
				readOnly={readOnly}
			/>
		</BoxV>

		<BoxV>
			<Label>DUPLICATE WINDOW</Label>
			<NumberInput
				style={{ flex: 1 }}
				value={config.duplicateWindow}
				onChange={duplicateWindow => handlePropChange({ duplicateWindow })}
				readOnly={readOnly}
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
						readOnly={readOnly}
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
					readOnly={readOnly || !isNew}
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
							readOnly={readOnly || !isNew}
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
							readOnly={readOnly || !isNew}
						/>
					</BoxV>
					<BoxV>
						<Label type={LABELS.SUBTEXT}>FILTER SUBJECT</Label>
						<TextInput
							value={config.mirror?.filterSubject}
							onChange={filterSubject => handleMirrorPropChange({ filterSubject })}
							readOnly={readOnly || !isNew}
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
				readOnly={readOnly}
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
					readOnly={readOnly}
				/>
			</ElementDialog>
		</BoxV>

		<Box>
			<IconToggle
				check={config.sealed}
				onChange={sealed => handlePropChange({ sealed })}
				readOnly={readOnly}
			/>
			<Label>SEALED</Label>
		</Box>

		<Box>
			<IconToggle
				check={config.denyDelete}
				onChange={denyDelete => handlePropChange({ denyDelete })}
				readOnly={readOnly || !isNew}
			/>
			<Label>DENY DELETE</Label>
		</Box>

		<Box>
			<IconToggle
				check={config.denyPurge}
				onChange={denyPurge => handlePropChange({ denyPurge })}
				readOnly={readOnly || !isNew}
			/>
			<Label>DENY PURGE</Label>
		</Box>

		<Box>
			<IconToggle
				check={config.allowRollupHdrs}
				onChange={allowRollupHdrs => handlePropChange({ allowRollupHdrs })}
				readOnly={readOnly}
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
					readOnly={readOnly}
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
							readOnly={readOnly}
						/>
					</BoxV>
					<BoxV>
						<Label type={LABELS.SUBTEXT}>DESTINATION</Label>
						<TextInput
							value={config.republish?.dest}
							onChange={dest => handleRepublishPropChange({ dest })}
							readOnly={readOnly}
						/>
					</BoxV>
					<Box>
						<IconToggle
							check={config.republish?.headersOnly}
							onChange={headersOnly => handleRepublishPropChange({ headersOnly })}
							readOnly={readOnly}
						/>
						<Label type={LABELS.SUBTEXT}>HEADERS ONLY</Label>
					</Box>
				</Quote>
			</Accordion>
		</BoxV>


	</Form>
}

export default ConfigForm

const cssList = (readOnly: boolean, variant: number): React.CSSProperties => ({
	backgroundColor: readOnly ? "rgb(0 0 0 / 50%)" : layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	color: layoutSo.state.theme.palette.var[variant].bg,
})