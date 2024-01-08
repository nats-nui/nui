import Accordion from "@/components/Accordion"
import Box from "@/components/Box"
import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import Dialog from "@/components/dialogs/Dialog"
import Label from "@/components/input/Label"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import List from "@/components/lists/List"
import EditStringRow from "@/components/rows/EditStringRow"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DISCARD_POLICY, POLICY, STORAGE, Source, UM_BIT } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import EditSourceCmp from "./EditSourceCmp"
import ListDialog from "./ListDialog"
import ElementDialog from "./ElementDialogProps"



interface Props {
	store?: StreamStore
}

const StreamDetail2View: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs

	// HANDLER
	const handleCreateClick = async () => streamSo.createNew()
	const handleEditClick = async () => streamSo.setReadOnly(false)
	const handleCancelClick = () => streamSo.setReadOnly(true)
	const handleSaveClick = () => streamSo.setReadOnly(true)

	const handleNameChange = (name: string) => streamSo.setStream({ ...streamSa.stream, name })
	const handleDescriptionChange = (description: string) => streamSo.setStream({ ...streamSa.stream, description })
	const handleSubjectsChange = (subjects: string[]) => streamSo.setStream({ ...streamSa.stream, subjects })

	const handleAllowRollUpsChange = (AllowRollUps: boolean) => streamSo.setStream({ ...streamSa.stream, AllowRollUps })
	const handleAllowDeletionChange = (AllowDeletion: boolean) => streamSo.setStream({ ...streamSa.stream, AllowDeletion })
	const handleAllowPurgingChange = (AllowPurging: boolean) => streamSo.setStream({ ...streamSa.stream, AllowPurging })

	const handleStorageSelect = (storage: STORAGE) => streamSo.setStream({ ...streamSa.stream, storage })

	const [umIndex, setUmIndex] = useState<number>(0)
	const handleMaxBytesChange = (maxBytes: number) => streamSo.setStream({ ...streamSa.stream, maxBytes })



	const [elementSource, setElementSource] = useState<HTMLElement>(null)
	const [souceIndex, setSourceIndex] = useState<number>(null)
	const handleSourceDialog = (index: number, e) => {
		setSourceIndex(index)
		setElementSource(!!elementSource ? null : e.target)
	}
	const handleSourceChange = (source: Source) => {
		streamSa.stream.sources[souceIndex] = source
		streamSo.setStream({ ...streamSa.stream })
	}



	const handlePolicySelect = (policy: POLICY) => streamSo.setStream({ ...streamSa.stream, policy })
	const handleDiscardPolicySelect = (discardPolicy: DISCARD_POLICY) => streamSo.setStream({ ...streamSa.stream, discardPolicy })


	// RENDER
	const isNew = streamSa.stream?.id == null
	if (streamSa.stream == null) return null
	const readOnly = streamSa.readOnly
	const variant = streamSo.getColorVar()

	return <FrameworkCard
		variantBg={variant}
		store={streamSo}
		actionsRender={isNew ? (
			<Button
				label="CREATE"
				variant={variant}
				onClick={handleCreateClick}
			/>
		) : readOnly ? (
			<Button
				label="EDIT"
				variant={variant}
				onClick={handleEditClick}
			/>
		) : (<>
			<Button
				label="SAVE"
				variant={variant}
				onClick={handleSaveClick}
			/>
			<Button
				label="CANCEL"
				variant={variant}
				onClick={handleCancelClick}
			/>
		</>)}
	>
		<Label>NAME</Label>
		<TextInput
			value={streamSa.stream.name}
			onChange={handleNameChange}
			variant={variant}
			readOnly={readOnly}
		/>

		<Label>DESCRIPTION</Label>
		<TextInput
			value={streamSa.stream.description}
			onChange={handleDescriptionChange}
			variant={variant}
			readOnly={readOnly}
		/>

		<ListDialog
			title="STORAGE"
			store={streamSo}
			select={Object.values(STORAGE).indexOf(streamSa.stream.storage)}
			items={Object.values(STORAGE)}
			RenderRow={({ item }) => item}
			readOnly={readOnly}
			onSelect={(index) => { handleStorageSelect(Object.values(STORAGE)[index]) }}
		/>

		<Label>SUBJECTS</Label>
		<EditList<string>
			items={streamSa.stream.subjects}
			onChangeItems={handleSubjectsChange}
			variant={variant}
			readOnly={readOnly}
			fnNewItem={() => "<new>"}
			RenderRow={EditStringRow}
		/>

		<Label>SOURCES</Label>
		<List<Source>
			items={streamSa.stream.sources}
			onSelect={handleSourceDialog}
			//readOnly={readOnly}
			RenderRow={({ item }) => item.name}
		/>
		<ElementDialog
			//title="SOURCES"
			element={elementSource}
			store={streamSo}
			width={150}
			onClose={() => setElementSource(null)}
		>
			<EditSourceCmp
				source={streamSa.stream.sources[souceIndex]}
				onChange={handleSourceChange}
				readOnly={readOnly}
			/>
		</ElementDialog>



		<ListDialog
			title="POLICY"
			store={streamSo}
			select={Object.values(POLICY).indexOf(streamSa.stream.policy)}
			items={Object.values(POLICY)}
			RenderRow={({ item }) => item}
			readOnly={readOnly}
			onSelect={(index) => { handlePolicySelect(Object.values(POLICY)[index]) }}
		/>

		<ListDialog
			title="DISCARD POLICY"
			store={streamSo}
			select={Object.values(DISCARD_POLICY).indexOf(streamSa.stream.discardPolicy)}
			items={Object.values(DISCARD_POLICY)}
			RenderRow={({ item }) => item}
			readOnly={readOnly}
			onSelect={(index) => { handleDiscardPolicySelect(Object.values(DISCARD_POLICY)[index]) }}
		/>


		<Box style={{ marginTop: 8 }}>
			<IconToggle
				check={streamSa.stream.AllowRollUps}
				onChange={handleAllowRollUpsChange}
				readOnly={readOnly}
			/>
			<Label style={{ marginTop: 0 }}>ALLOW ROLL-UPS</Label>
		</Box>
		<Box>
			<IconToggle
				check={streamSa.stream.AllowDeletion}
				onChange={handleAllowDeletionChange}
				readOnly={readOnly}
			>
			</IconToggle>
			<Label style={{ marginTop: 0 }}>ALLOW DELETION</Label>
		</Box>
		<Box>
			<IconToggle
				check={streamSa.stream.AllowPurging}
				onChange={handleAllowPurgingChange}
				readOnly={readOnly}
			>
			</IconToggle>
			<Label style={{ marginTop: 0 }}>ALLOW PURGING</Label>
		</Box>

		<Box style={{ marginTop: 8 }}>
			<IconToggle
				check={streamSa.stream.maxBytes != null}
				onChange={(check) => handleMaxBytesChange(check ? 0 : null)}
				readOnly={readOnly}
			/>
			<Label style={{ marginTop: 0 }}>MAX BYTES</Label>
		</Box>
		<Accordion open={streamSa.stream.maxBytes != null}>
			<Box>
				<NumberInput
					style={{ flex: 1 }}
					value={streamSa.stream.maxBytes}
					onChange={handleMaxBytesChange}
					variant={variant}
					readOnly={readOnly}
				/>
				<ListDialog
					store={streamSo}
					select={umIndex}
					items={Object.values(UM_BIT)}
					RenderRow={({ item }) => item}
					readOnly={readOnly}
					onSelect={(index) => setUmIndex(index)}
				/>
			</Box>
		</Accordion>


	</FrameworkCard>
}

export default StreamDetail2View

const cssList = (readOnly: boolean, variant: number): React.CSSProperties => ({
	backgroundColor: readOnly ? "rgb(0 0 0 / 50%)" : layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	color: layoutSo.state.theme.palette.var[variant].bg,
})