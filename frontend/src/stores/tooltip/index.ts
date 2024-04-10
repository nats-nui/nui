import { StoreCore, createStore } from "@priolo/jon"



export interface TooltipContent {
	content: React.ReactNode
	targetRect: DOMRect
	color?: string
	id?: string
}

const setup = {

	state: {
		show: false,
		content: <TooltipContent>null,
	},

	getters: {
	},

	actions: {
		open(content: TooltipContent, store?: TooltipStore) {
			store.setContent(content)
			store.setShow(true)
		},
		async close(_: void, store?: TooltipStore) {
			store.setShow(false)
			// ... hide
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


