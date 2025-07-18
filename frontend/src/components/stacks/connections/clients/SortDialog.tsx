import { ClientMetricsStore } from "@/stores/stacks/connection/clients"
import { SORTABLE_PROPERTIES } from "@/stores/stacks/connection/clients/types"
import { Dialog, List } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"



interface Props {
	store?: ClientMetricsStore
}

const SortDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleClose = () => {
		store.setSortOpen(false)
	}
	const handleSelect = (index: number) => {
		store.setSort(sorts[index])
		store.setSortOpen(false)
	}

	// RENDER
	const sorts = Object.values( SORTABLE_PROPERTIES )
	const indexSelect = useMemo(() => sorts.indexOf(store.state.sort), [store.state.sort])

	return (
		<Dialog
			open={store.state.sortOpen}
			title="SORT BY"
			width={100}
			store={store}
			onClose={handleClose}
		>
			<List<string>
				items={sorts}
				select={indexSelect}
				onSelect={handleSelect}
			/>
		</Dialog>
	)
}

export default SortDialog
