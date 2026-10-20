import { deckCardsSo } from "@/stores/docs/cards"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import CardIcon from "../../components/cards/CardIcon"
import { DOC_TYPE } from "../../types"
import MenuButton from "./MenuButton"
import { menuSo } from "../../stores/docs/links"
import { focusSo } from "@priolo/jack"



interface Props {
	label?: string
	badge?: React.ReactNode
	store?: ViewStore
}

const StoreButton: FunctionComponent<Props> = ({
	label,
	badge,
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleOpenStoreClick = async (view: ViewStore) => {
		await deckCardsSo.add({ view, anim: true })
		focusSo.focus(view)
	}
	const handleDeleteButtonClick = (view: ViewStore) => menuSo.remove(view)

	// RENDER
	if (!store) return null
	const type = store.state.type as DOC_TYPE
	const canDelete = store.state.pinnable
	if (!label) label = store.getSubTitle()

	return (
		<MenuButton
			title={store.getTitle()}
			subtitle={label}
			badge={badge}
			onClick={() => handleOpenStoreClick(store)}
			onClose={canDelete ? () => handleDeleteButtonClick(store) : null}
		>
			<CardIcon type={type} style={{ width: 20, color: "var(--accent)" }} />
		</MenuButton>
	)
}

export default StoreButton
