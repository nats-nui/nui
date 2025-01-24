import { cardsSetup, CardsState, CardsStore, docsSo } from "@priolo/jack"
import { createStore, mixStores } from "@priolo/jon"
import { delay } from "../../utils/time"



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
	actions: {
		toggle: async (_: void, store?: DrawerStore) => {
			const w = store.state.lastWidth < 20 ? 500 : store.state.lastWidth
			store.state.animation = true
			store.setWidth(store.state.width > 0 ? 0 : w)
			await delay(400)
			store.state.animation = false
		}
	},
	mutators: {
		setWidth: (width: number) => ({ width }),
	},
}
export type DrawerState = typeof setupDrawer.state & CardsState
type DrawerMutators = typeof setupDrawer.mutators
type DrawerActions = typeof setupDrawer.actions
export interface DrawerStore extends CardsStore, DrawerMutators, DrawerActions { state: DrawerState }

export const drawerCardsSo = createStore(mixStores(cardsSetup, setupDrawer)) as DrawerStore


docsSo.setAllDeck([deckCardsSo, drawerCardsSo])