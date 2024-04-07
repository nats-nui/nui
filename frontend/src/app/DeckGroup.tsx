//import srcBg from "@/assets/bg4.jpg"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./DeckGroup.module.css"
import CardsGroup from "./CardsGroups"
import { CardsState, deckCardsSo } from "../stores/docs/cards"



const DeckGroup: FunctionComponent = () => {

	// STORES
	const deckCardsSa: CardsState = useStore(deckCardsSo)

	// HOOKS
	const cards = deckCardsSa.all

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>
			<CardsGroup storesGroup={cards} />
		</div>
	)
}

export default DeckGroup

