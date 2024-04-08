import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { CardsState, deckCardsSo } from "../stores/docs/cards"
import CardsGroup from "./CardsGroups"
import cls from "./DeckGroup.module.css"



const DeckGroup: FunctionComponent = () => {

	// STORES
	const deckCardsSa: CardsState = useStore(deckCardsSo)

	// HOOKS
	const cards = deckCardsSa.all

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>
			<CardsGroup cardsStore={deckCardsSo}/>
		</div>
	)
}

export default DeckGroup

