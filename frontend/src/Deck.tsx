//import srcBg from "@/assets/bg4.jpg"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./Deck.module.css"
import CardCmp from "./components/cards/CardCmp"
import { CardsState, deckCardsSo } from "./stores/docs/cards"



const Deck: FunctionComponent = () => {

	// STORES
	const deckCardsSa: CardsState = useStore(deckCardsSo)

	// HOOKS
	const stores = deckCardsSa.all

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>
			{stores.map((store: ViewStore) =>
				<CardCmp key={store.state.uuid}
					store={store}
				/>
			)}
		</div>
	)
}

export default Deck

