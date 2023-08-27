import { POSITION_TYPE } from "@/stores/docs/types"
import navSo from "@/stores/navigation"
import { StoreCore, createStore } from "@priolo/jon"
import { ViewStore } from "./docBase"
import { docsFromString, stringFromDocs } from "./utils"
import { initView } from "./utils/factory"
import { aggregate, disgregate, getById } from "./utils/manage"


const setup = {

	state: {
		focus: <number>null,
		all: <ViewStore[]>[],
	},

	getters: {
		getById(id: string, store?: DocStore): ViewStore {
			return getById(store.state.all, id)
		},
	},

	actions: {
		/** inserisco un DOC nella "root" con "index" */
		add(
			{ view, index }: { view: ViewStore, index?: number },
			store?: DocStore
		) {
			// se esiste gia' setto il fuoco e basta
			// per il momento lo levo ma dovro' cercare le finestre UNICHE
			// cioe' se un ViewStore è settato come "unico" allora non si possono aprire piu' istanze di quello
			//const find = getById(store.state.all, getID(view))
			//if (find) {	/* set focus */ return }

			// se non c'è lo store lo creo
			view.state.parent = null
			view.state.position = POSITION_TYPE.DETACHED
			// ---
			const newViews = [...store.state.all]
			if (index == null) newViews.push(view); else newViews.splice(index, 0, view);
			store.setAll(newViews)
		},
		/** inserisco una VIEW come link di un altra VIEW */
		addLink(
			{ view, parent }: { view: ViewStore, parent: ViewStore },
			store?: DocStore
		) {
			if (!parent) return

			// se c'e' gia' una view la rimuovo
			if (parent.state.linked) store.remove(parent.state.linked)

			if (!view) return

			// se non c'è lo store lo creo
			view.state.parent = parent
			view.state.position = POSITION_TYPE.LINKED
			parent.state.linked = view
			// ---
			store.setAll([...store.state.all])
		},
		/** inserisco una VIEW nello STACK di un altra VIEW */
		addStack(
			{ view, parent }: { view: ViewStore, parent: ViewStore },
			store?: DocStore
		) {
			if (!parent || !view) return
			// se il parent è in STACK allora vado sul suo parent
			if (parent.state.parent && parent.state.position == POSITION_TYPE.STACKED) parent = parent.state.parent
			// se non c'è lo store lo creo
			if (!parent.state.stacked) parent.state.stacked = []
			view.state.parent = parent
			view.state.position = POSITION_TYPE.STACKED
			parent.state.stacked.push(view)
			// ---
			store.setAll([...store.state.all])
		},
		/** posto in evidenza una VIEW dello STACK */
		showStack(view: ViewStore, store?: DocStore) {
			// if (!view || !view.parent) return
			// const parent = view.parent
			// const index = store.state.all.indexOf(parent)
			// store.remove(parent)
			// let stack = [...parent.stacked]
			// for (const v of stack) store.remove(v)
			// stack = [parent].concat(stack.filter(v => v != view))
			// for (const v of stack) store.addStack({ view: v, parent: view })
			// store.add({ view, index })
		},

		/** inserisco una VIEW nello STACK di un altra VIEW */
		remove(view: ViewStore, store?: DocStore) {
			const views = [...store.state.all]
			let index: number
			// se non c'e' il parent lo sfilo via e basta
			if (!view.state.parent) {
				index = views.findIndex(v => v == view)
				if (index != -1) views.splice(index, 1)

			} else if (view == view.state.parent.state.linked) {
				view.state.parent.state.linked = null
			} else if ((index = view.state.parent.state.stacked?.indexOf(view)) != -1) {
				view.state.parent.state.stacked?.splice(index, 1)
			}
			view.state.parent = null
			view.state.position = null
			store.setAll(views)
		},

		move({ view, index }: { view: ViewStore, index: number }, store?: DocStore) {
			if (view == null || index == null) return
			if (view.state.parent == null) {
				const srcIndex = store.state.all.indexOf(view)
				if (srcIndex == index || srcIndex + 1 == index) return
				store.remove(view)
				if (srcIndex > index) {
					store.add({ view, index })
				} else {
					store.add({ view, index: index - 1 })
				}
			} else {
				store.remove(view)
				store.add({ view, index })
			}
		},
		/** sostituisco tutti i DOC con quelli ricavati da una stringa (tipicamente URL) */
		updateFromString(docsStr: string, store?: DocStore) {
			const views = docsFromString(docsStr)
			const stores = views.map(view => initView(view)).filter(store => !!store)
			const storesAgg = aggregate(stores)
			store.setAll(storesAgg)
		},
	},

	mutators: {
		setAll: (all: ViewStore[]) => {
			const views: ViewStore[] = disgregate(all)
			navSo.setParams(["docs", stringFromDocs(views)])
			return { all }
		},
		setFocus: (focus: number) => ({ focus }),
	},
}

export type DocState = typeof setup.state
export type DocGetters = typeof setup.getters
export type DocActions = typeof setup.actions
export type DocMutators = typeof setup.mutators
export interface DocStore extends StoreCore<DocState>, DocGetters, DocActions, DocMutators {
	state: DocState
}
const store = createStore(setup) as DocStore
export default store

var decodedQueryString = decodeURIComponent(window.location.search.substring(1));
navSo.setQuery(decodedQueryString)
const docsStr = navSo.getSearchUrl("docs") as string
store.updateFromString(docsStr)


