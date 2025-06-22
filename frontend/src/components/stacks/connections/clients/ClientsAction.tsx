import { ClientMetricsStore } from "@/stores/stacks/connection/clients"
import { Button, FindInputHeader } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store: ClientMetricsStore
}

const ClientsActions: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleSortClick = () => {
		//store.setSortBy((store.state.sortBy === "cid") ? "last_activity" : "cid")
	}

	// RENDER
	return <>
		<FindInputHeader style={{ marginLeft: 10 }}
			value={store.state.textSearch}
			onChange={text => store.setTextSearch(text)}
		/>
		<Button
			children="SORT"
			onClick={handleSortClick}
		/>
	</>
}

export default ClientsActions
