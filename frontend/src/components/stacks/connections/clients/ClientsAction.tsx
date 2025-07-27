import ArrowDownIcon from "@/icons/ArrowDownIcon"
import SortDownIcon from "@/icons/SortDownIcon"
import SortUpIcon from "@/icons/SortUpIcon"
import { ClientMetricsStore } from "@/stores/stacks/connection/clients"
import { Button, FindInputHeader, IconButton, IconToggle } from "@priolo/jack"
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
		store.setSortOpen(!store.state.sortOpen)
	}
	const handleSortOrderClick = () => {
		store.setSortIsDesc(!store.state.sortIsDesc)
	}

	// RENDER
	return <>

		<FindInputHeader style={{ marginLeft: 10, marginRight: 15 }}
			value={store.state.textSearch}
			onChange={text => store.setTextSearch(text)}
		/>

		<IconButton effect
			onClick={handleSortOrderClick}
		>
			{store.state.sortIsDesc ? <SortDownIcon /> : <SortUpIcon />}
		</IconButton>

		<Button select={store.state.sortOpen}
			children={<>
				<span style={{ fontWeight: 400, opacity: .8 }}>SORT: </span>
				<span>{store.state.sort}</span>
			</>}
			onClick={handleSortClick}
		/>
		
	</>
}

export default ClientsActions
