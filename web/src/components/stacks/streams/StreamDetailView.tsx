import FrameworkCard from "@/components/FrameworkCard"
import Options from "@/components/Options"
import Button from "@/components/buttons/Button"
import Label from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import layoutSo from "@/stores/layout"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { STORAGE } from "@/types/Stream"
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
	const handleStorageSelect = (storage: STORAGE) => streamSo.setStream({ ...streamSa.stream, storage })

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

		<Label>STORAGE</Label>
		<Options<STORAGE>
			style={cssList}
			value={streamSa.stream.storage}
			items={Object.values(STORAGE)}
			RenderRow={({ item }) => item}
			onSelect={handleStorageSelect}
		/>

		<Label>STORAGE2</Label>
		<Options<STORAGE>
			style={cssList}
			value={streamSa.stream.storage}
			items={Object.values(STORAGE)}
			RenderRow={({ item }) => item}
			onSelect={handleStorageSelect}
		/>

<Label>NAME</Label>
		<TextInput
			value={streamSa.stream.name}
			onChange={handleNameChange}
		/>

<Label>NAME</Label>
		<TextInput
			value={streamSa.stream.name}
			onChange={handleNameChange}
		/>

<Label>NAME</Label>
		<TextInput
			value={streamSa.stream.name}
			onChange={handleNameChange}
		/>

<Label>NAME</Label>
		<TextInput
			value={streamSa.stream.name}
			onChange={handleNameChange}
		/>

	</FrameworkCard>
}

export default StreamDetailView

const cssList = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
}