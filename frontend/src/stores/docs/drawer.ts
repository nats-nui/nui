import { cardsSetup } from "@priolo/jack"
import { mixStores, StoreOf } from "@priolo/jon"
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

export interface DrawerStore extends StoreOf<typeof setup> {}
export const setupDrawer = mixStores(cardsSetup, setup)
