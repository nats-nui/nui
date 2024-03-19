import docSo from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import MenuButton from "../buttons/MenuButton"
import CardIcon from "../cards/CardIcon"



interface Props {
	store?: ViewStore
	style?: React.CSSProperties,
}

const StoreButton: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs

	// HANDLER
	const handleOpenStoreClick = (view: ViewStore) => docSo.add({ view, anim: true })
	const handleCloseStoreClick = (store: ViewStore) => docSo.unpinned(store)

	// RENDER
	const type = store.state.type
	const cls = `var${store.state.colorVar}`

	return (
		<MenuButton className={cls} selected 
			title={store.getTitle()}
			subtitle={store.getSubTitle()}
			onClick={() => handleOpenStoreClick(store)}
			onClose={() => handleCloseStoreClick(store)}
		>
			<CardIcon type={type} style={{width: 20}} className="color-fg"/>
		</MenuButton>
	)
}

export default StoreButton
