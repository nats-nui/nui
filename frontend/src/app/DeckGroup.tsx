import { FunctionComponent } from "react"
import { deckCardsSo } from "../stores/docs/cards"
import CardsGroup from "./CardsGroups"
import cls from "./DeckGroup.module.css"
import PolymorphicCard from "../components/cards/PolymorphicCard"



const DeckGroup: FunctionComponent = () => {

	// STORES

	// HOOKS

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>
			<CardsGroup 
				cardsStore={deckCardsSo}
				Render={PolymorphicCard}
			/>
		</div>
	)
}

export default DeckGroup

