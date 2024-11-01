import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { CnnLoaderStore } from "../../../stores/stacks/connectionLoader"



interface Props {
	store?: CnnLoaderStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleImportClick = async () => store.import()

	// RENDER
	const haveList = store.state.imports?.length > 0
	if ( haveList ) return null

	return <>

		<Button
			children="IMPORT"
			onClick={handleImportClick}
		/>
	</>
}

export default ActionsCmp
