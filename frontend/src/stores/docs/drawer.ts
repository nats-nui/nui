import { cardsSetup, CardsState, CardsStore } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { delay } from "../../utils/time"



// creo il DRAWER
const setup = {
	state: {
		width: 0,
		/** indica che deve attivare l'animazione */
		animation: false,
		/** l'ultimo gap prima di chiuderlo */
		lastWidth: 500,
	},
	getters: {
		isOpen: (_: void, store?: DrawerStore) => store.state.width > 0,
	},
	actions: {
		toggle: async (_: void, store?: DrawerStore) => {
			const w = store.state.lastWidth < 20 ? 500 : store.state.lastWidth
			store.state.animation = true
			store.setWidth(store.isOpen() ? 0 : w)
			await delay(400)
			store.state.animation = false
		}
	},
	mutators: {
		setWidth: (width: number) => ({ width }),
	},
}
export type DrawerState = typeof setup.state & CardsState
type DrawerMutators = typeof setup.mutators
type DrawerGetters = typeof setup.getters
type DrawerActions = typeof setup.actions
export interface DrawerStore extends CardsStore, DrawerGetters, DrawerMutators, DrawerActions { state: DrawerState }

export const setupDrawer = mixStores(cardsSetup, setup)


