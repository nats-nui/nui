import Box from "@/components/Box"
import FrameworkCard from "@/components/FrameworkCard"
import Options from "@/components/Options"
import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import Dialog from "@/components/dialogs/Dialog"
import Label from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import EditSourceRow from "@/components/rows/EditSourceRow"
import EditStringRow from "@/components/rows/EditStringRow"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DISCARD_POLICY, POLICY, STORAGE, Source } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"



interface Props {
	store?: StreamStore
}

const StreamDetailView: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	//useStore(docSo)
	const streamSa = useStore(streamSo)
	//const cnnSa = useStore(cnnSo)

	// HOOKs
	//useEffect(() => {
	// let cnn = streamSo.getConnection()
	// if (cnn == null) cnn = {
	// 	name: "",
	// 	hosts: [],
	// 	subscriptions: [],
	// 	auth: []
	// }
	// streamSo.setConnection(cnn)
	//}, [cnnSa.all])

	// HANDLER
	const handleCreateClick = async () => streamSo.createNew()
	const handleEditClick = async () => streamSo.setReadOnly(false)
	const handleCancelClick = () => streamSo.setReadOnly(true)
	const handleSaveClick = () => streamSo.setReadOnly(true)

	const handleNameChange = (name: string) => streamSo.setStream({ ...streamSa.stream, name })
	const handleDescriptionChange = (description: string) => streamSo.setStream({ ...streamSa.stream, description })
	const handleStorageSelect = (storage: STORAGE) => streamSo.setStream({ ...streamSa.stream, storage })
	const handleSubjectsChange = (subjects: string[]) => streamSo.setStream({ ...streamSa.stream, subjects })
	const handleSourcesChange = (sources: Source[]) => streamSo.setStream({ ...streamSa.stream, sources })
	const handlePolicySelect = (policy: POLICY) => streamSo.setStream({ ...streamSa.stream, policy })
	const handleDiscardPolicySelect = (discardPolicy: DISCARD_POLICY) => streamSo.setStream({ ...streamSa.stream, discardPolicy })
	const handleAllowRollUpsChange = (AllowRollUps: boolean) => streamSo.setStream({ ...streamSa.stream, AllowRollUps })
	const handleAllowDeletionChange = (AllowDeletion: boolean) => streamSo.setStream({ ...streamSa.stream, AllowDeletion })
	const handleAllowPurgingChange = (AllowPurging: boolean) => streamSo.setStream({ ...streamSa.stream, AllowPurging })



	const [testOpen, setTestOpen] = useState(false)

	const handleTestDialog = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		setTestOpen(true)
	}

	// RENDER
	const isNew = streamSa.stream?.id == null
	if (streamSa.stream == null) return null
	const readOnly = streamSa.readOnly
	const variant = streamSo.getColorBg()

	return <FrameworkCard
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

		<Label>STORAGE</Label>
		<Options<STORAGE>
			value={streamSa.stream.storage}
			items={Object.values(STORAGE)}
			RenderRow={({ item }) => item}
			variant={variant}
			readOnly={readOnly}
			onSelect={handleStorageSelect}
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
		<EditList<Source>
			style={cssList(readOnly, variant)}
			items={streamSa.stream.sources}
			onChangeItems={handleSourcesChange}
			variant={variant}
			readOnly={readOnly}
			RenderRow={EditSourceRow}
		/>

		<Label>POLICY</Label>
		<Options<POLICY>
			value={streamSa.stream.policy}
			items={Object.values(POLICY)}
			RenderRow={({ item }) => item}
			variant={variant}
			readOnly={readOnly}
			onSelect={handlePolicySelect}
		/>

		<Label>DISCARD POLICY</Label>
		<Options<DISCARD_POLICY>
			value={streamSa.stream.discardPolicy}
			items={Object.values(DISCARD_POLICY)}
			RenderRow={({ item }) => item}
			variant={variant}
			readOnly={readOnly}
			onSelect={handleDiscardPolicySelect}
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

		<Button
			label="TEST"
			onClick={handleTestDialog}
		/>
		<Dialog
			title="TEST"
			width={200}
			open={testOpen}
			store={streamSo}
			//variant={variant}
		//onClose={handleCloseSubsDialog}
		>
			CIAO
		</Dialog>

	</FrameworkCard>
}

export default StreamDetailView

const cssList = (readOnly: boolean, variant: number): React.CSSProperties => ({
	backgroundColor: readOnly ? "rgb(0 0 0 / 50%)" : layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	color: layoutSo.state.theme.palette.var[variant].bg,
})