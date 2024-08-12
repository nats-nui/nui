import { FunctionComponent } from "react"
import { deckCardsSo } from "../stores/docs/cards"
import cls from "./DeckGroup.module.css"
import PolymorphicCard from "../components/cards/PolymorphicCard"
import { CardsGroup } from "@priolo/jack"



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

