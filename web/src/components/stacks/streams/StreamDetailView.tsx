import FrameworkCard from "@/components/FrameworkCard"
import Options from "@/components/Options"
import Button from "@/components/buttons/Button"
import Label from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import EditSourceRow from "@/components/rows/EditSourceRow"
import EditStringRow from "@/components/rows/EditStringRow"
import layoutSo from "@/stores/layout"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { STORAGE, Source } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



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
			readOnly={readOnly}
		/>

		<Label>DESCRIPTION</Label>
		<TextInput
			value={streamSa.stream.description}
			onChange={handleDescriptionChange}
			readOnly={readOnly}
		/>

		<Label>STORAGE</Label>
		<Options<STORAGE>
			style={cssList}
			value={streamSa.stream.storage}
			items={Object.values(STORAGE)}
			RenderRow={({ item }) => item}
			onSelect={handleStorageSelect}
		/>

		<Label>SUBJECTS</Label>
		<EditList<string>
			style={cssList}
			items={streamSa.stream.subjects}
			onChangeItems={handleSubjectsChange}
			fnNewItem={() => "<new>"}
			RenderRow={EditStringRow}
		/>

		<Label>SOURCES</Label>
		<EditList<Source>
			style={cssList}
			items={streamSa.stream.sources}
			onChangeItems={handleSourcesChange}
			RenderRow={EditSourceRow}
		/>

	</FrameworkCard>
}

export default StreamDetailView

const cssList = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
}