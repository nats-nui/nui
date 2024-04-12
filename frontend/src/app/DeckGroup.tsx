import { FunctionComponent } from "react"
import { deckCardsSo } from "../stores/docs/cards"
import CardsGroup from "./CardsGroups"
import cls from "./DeckGroup.module.css"



const DeckGroup: FunctionComponent = () => {

	// STORES

	// HOOKS

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>
			<CardsGroup cardsStore={deckCardsSo}/>
		</div>
	)
}

export default DeckGroup

