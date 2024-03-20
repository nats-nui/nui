import docSo from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import MenuButton from "../buttons/MenuButton"
import CardIcon from "../cards/CardIcon"
import { DOC_TYPE } from "@/types"



interface Props {
	store?: ViewStore
}

const StoreButton: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs

	// HANDLER
	const handleOpenStoreClick = (view: ViewStore) => docSo.add({ view, anim: true })
	const handleCloseStoreClick = (store: ViewStore) => docSo.pinnedDelete(store)

	// RENDER
	const type = store.state.type
	const cls = `var${store.state.colorVar}`
	const canDelete = store.state.pinnable

	return (
		<MenuButton className={cls} selected 
			title={store.getTitle()}
			subtitle={store.getSubTitle()}
			onClick={() => handleOpenStoreClick(store)}
			onClose={canDelete ? () => handleCloseStoreClick(store) : null}
		>
			<CardIcon type={type} style={{width: 20}} className="color-fg"/>
		</MenuButton>
	)
}

export default StoreButton
