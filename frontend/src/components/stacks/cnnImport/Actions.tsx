import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { CnnImportStore, IMPORT_STATUS } from "../../../stores/stacks/cnnImport"



interface Props {
	store?: CnnImportStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleImportClick = async () => {
		if (store.state.status == IMPORT_STATUS.LOADING ) return
		store.import()
	}

	// RENDER
	if (store.state.status == IMPORT_STATUS.DONE) return null
	const clsRoot = store.state.status == IMPORT_STATUS.LOADING ? "jack-ani-loading" : ""
	const styRoot = store.state.status == IMPORT_STATUS.LOADING ? { color: "var(--cmp-select-fg)"} : null
	
	return <>
		<Button
			className={clsRoot} style={styRoot}
			children="IMPORT"
			onClick={handleImportClick}
		/>
	</>
}

export default ActionsCmp
