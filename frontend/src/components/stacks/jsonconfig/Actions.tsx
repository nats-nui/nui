import { JsonConfigStore } from "@/stores/stacks/jsonconfig"
import { Button, CopyButton } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: JsonConfigStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleSaveClick = async () => store.save()

	// RENDER
	return <>
		<CopyButton value={() => store.state.value} />
		<Button
			children="APPLY"
			onClick={handleSaveClick}
		/>
	</>
}

export default ActionsCmp
