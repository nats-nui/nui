import docSo from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import IconRow from "../rows/IconRow"



interface Props {
	store?: ViewStore
	style?: React.CSSProperties,
}

const StoreIcon: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs


	// HANDLER
	const handleOpenStoreClick = (view: ViewStore) => {
		docSo.add({ view, anim: true })
	}
	const handleCloseStoreClick = (store: ViewStore) => {
		docSo.unpinned(store)
	}

	// RENDER
	return (
		<IconRow selected
			title={store.getTitle()}
			subtitle={store.getSubTitle()}
			variant={state.colorVar}
			onClick={() => handleOpenStoreClick(store)}
			onClose={() => handleCloseStoreClick(store)}
		/>
	)
}

export default StoreIcon
