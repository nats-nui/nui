import { StoreCore, createStore } from "@priolo/jon"
import { Position } from "../mouse/utils"


export interface TooltipContent {
	content?: React.ReactNode
	position?: Position
	variant?: number
}

const setup = {

	state: {
		show: false,
		content: <TooltipContent>null,
	},

	getters: {
	},

	actions: {
		openOnElem (content: TooltipContent, store?: TooltipStore) {

		},
		open(content: TooltipContent, store?: TooltipStore) {
			store.setContent(content)
			store.setShow(true)
		},
		close(_: void, store?: TooltipStore) {
			store.setShow(false)
		},
	},

	mutators: {
		setShow: (show: boolean) => ({ show }),
		setContent: (content: TooltipContent) => ({ content }),
	},
}

export type TooltipState = typeof setup.state
export type TooltipGetters = typeof setup.getters
export type TooltipActions = typeof setup.actions
export type TooltipMutators = typeof setup.mutators
export interface TooltipStore extends StoreCore<TooltipState>, TooltipGetters, TooltipActions, TooltipMutators {
	state: TooltipState
}
const store = createStore(setup) as TooltipStore
export default store


