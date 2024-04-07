import { deckCardsSo, menuCardsSo } from "@/stores/docs/cards"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import MenuButton from "../buttons/MenuButton"
import CardIcon from "../cards/CardIcon"



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
	const handleOpenStoreClick = (view: ViewStore) => deckCardsSo.add({ view, anim: true })
	const handleCloseStoreClick = (view: ViewStore) => menuCardsSo.remove({ view })

	// RENDER
	if (!store) return null
	const type = store.state.type
	const cls = `var${store.state.colorVar}`
	const canDelete = store.state.pinnable
	const label = { [DOC_TYPE.CONNECTIONS]: "ALL", [DOC_TYPE.LOGS]: "LOGS" }[type] ?? null

	return (
		<MenuButton className={cls}
			title={store.getTitle()}
			subtitle={store.getSubTitle()}
			label={label}
			onClick={() => handleOpenStoreClick(store)}
			onClose={canDelete ? () => handleCloseStoreClick(store) : null}
		>
			<CardIcon type={type} style={{ width: 20 }} className="color-fg" />
		</MenuButton>
	)
}

export default StoreButton
