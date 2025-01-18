import { cardsSetup, CardsState, CardsStore, docsSo } from "@priolo/jack"
import { createStore, mixStores } from "@priolo/jon"



// creo il DECK
export const deckCardsSo = createStore(cardsSetup) as CardsStore

// creo il DRAWER
const setupDrawer = {
	state: {
		width: 0,
		/** indica che deve attivare l'animazione */
		animation: false,
		/** l'ultimo gap prima di chiuderlo */
		lastWidth: 500,
	},
	mutators: {
		setWidth: (width: number) => ({ width }),
	},
}
export type DrawerState = typeof setupDrawer.state & CardsState
type DrawerMutators = typeof setupDrawer.mutators
export interface DrawerStore extends CardsStore, DrawerMutators { state: DrawerState }

export const drawerCardsSo = createStore(mixStores(cardsSetup, setupDrawer)) as DrawerStore


docsSo.setAllDeck([deckCardsSo, drawerCardsSo])