import { deepEqual } from "@/utils/object"
import { StoreCore, createStore } from "@priolo/jon"
import { ViewStore } from "../stacks/viewBase"
import { forEachViews, getById } from "./utils/manage"



/**
 * gestisce un array di LINKs di VIEWs
 */
const setup = {

	state: {
		/** tutte le CARD LIKED */
		all: <ViewStore[]>[],
	},

	getters: {
		getById(id: string, store?: LinksStore): ViewStore {
			if (!id) return null
			return getById(store.state.all, id)
		},
		getIndexByView(view: ViewStore, store?: LinksStore) {
			return store.state.all.findIndex(v => v == view)
		},

		/** cerca nel DECK solo le CARD senza parent */
		find(state: any, store?: LinksStore) {
			return forEachViews(
				store.state.all,
				(view) => deepEqual(state, view.state) ? view : null
			)
		},
		/** cerca nel DECK su tutte le CARD (anche i children) */
		findAll(state: any, store?: LinksStore) {
			const ret: ViewStore[] = []
			forEachViews(
				store.state.all,
				(view) => {
					if (deepEqual(state, view.state)) ret.push(view)
				}
			)
			return ret
		},

	},

	actions: {

		/** aggiungo un LINK */
		async add(
			{ view, index }: { view: ViewStore, index?: number },
			store?: LinksStore
		) {
			// se c'e' gia' non faccio nulla
			if (forEachViews(store.state.all, (v) => v.state.uuid == view.state.uuid)) return
			const newViews = [...store.state.all]
			if (index == null) newViews.push(view); else newViews.splice(index, 0, view);
			store.setAll(newViews)
		},
		
		/** elimino un LINK */
		async remove( view: ViewStore, store?: LinksStore) {
			if (!view) return
			const views = [...store.state.all]
			const index = views.findIndex(v => v == view)
			if (index != -1) views.splice(index, 1)
			store.setAll(views)
		},
	},

	mutators: {
		setAll: (all: ViewStore[]) => ({ all }),
	},
}

export type LinksState = typeof setup.state
export type LinksGetters = typeof setup.getters
export type LinksActions = typeof setup.actions
export type LinksMutators = typeof setup.mutators
export interface LinksStore extends StoreCore<LinksState>, LinksGetters, LinksActions, LinksMutators {
	state: LinksState
}

export const menuSo = createStore(setup) as LinksStore