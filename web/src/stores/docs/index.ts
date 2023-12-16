import { ANIM_TIME, DOC_ANIM, POSITION_TYPE } from "@/stores/docs/types"
import navSo from "@/stores/navigation"
import { StoreCore, createStore } from "@priolo/jon"
import { ViewStore } from "./viewBase"
import { stringToViewsState, viewsToString } from "./utils/urlTransform"
import { buildStore } from "./utils/factory"
import { aggregate, disgregate, getById } from "./utils/manage"
import { delayAnim } from "@/utils/time"



/**
 * Gestisce la lista di DOCS presenti
 */
const setup = {

	state: {
		focus: <number>null,
		all: <ViewStore[]>[],
	},

	getters: {
		getById(id: string, store?: DocStore): ViewStore {
			return getById(store.state.all, id)
		},
		getIndexByView(view: ViewStore, store?: DocStore) {
			return store.state.all.findIndex(v => v == view)
		},
	},

	actions: {
		async add(
			{ view, index, anim = false }: { view: ViewStore, index?: number, anim?: boolean },
			store?: DocStore
		) {
			view.state.parent = null
			view.state.position = POSITION_TYPE.DETACHED
			const newViews = [...store.state.all]
			if (index == null) newViews.push(view); else newViews.splice(index, 0, view);
			store.setAll(newViews)

			if (anim) {
				await delayAnim()
				await view.docAnim(DOC_ANIM.SHOWING)
			}
		},

		/** inserisco una VIEW come link di un altra VIEW */
		async addLink(
			{ view, parent, anim = false }: { view: ViewStore, parent: ViewStore, anim?: boolean },
			store?: DocStore
		) {
			if (!parent) return

			// se c'e' gia' una view la rimuovo
			if (parent.state.linked) {
				await store.remove({view: parent.state.linked, anim})
			}
			if (!view) return

			// imposto la view
			parent.setLinked(view)
			store.setAll([...store.state.all])

			if (anim) {
				await delayAnim()
				await view.docAnim(DOC_ANIM.SHOWING)
			} else {
				view.setDocAnim(DOC_ANIM.SHOW)	
			}
		},

		/** inserisco una VIEW nello STACK di un altra VIEW */
		async remove({ view, anim = false }: { view: ViewStore, anim: boolean }, store?: DocStore) {
			if (anim) await view.docAnim(DOC_ANIM.EXITING)

			const views = [...store.state.all]
			let index: number

			// placed in ROOT
			if (!view.state.parent) {
				index = views.findIndex(v => v == view)
				if (index != -1) views.splice(index, 1)
				view.state.parent = null
				view.state.position = null

				// LINKED
			} else {
				view.state.parent.setLinked(null)
			}

			store.setAll(views)
		},

		/** sposta una view in un indice preciso dello STACK */
		async move({ view, index, anim = false }: { view: ViewStore, index: number, anim: boolean }, store?: DocStore) {
			if (view == null || index == null) return
			// se è direttamente in ROOT...
			if (view.state.parent == null) {
				const srcIndex = store.state.all.indexOf(view)
				if (srcIndex == index || srcIndex + 1 == index) return
				await store.remove({view, anim})
				if (srcIndex > index) {
					await store.add({ view, index, anim })
				} else {
					await store.add({ view, index: index - 1, anim })
				}
				// altrimenti la cancello e la ricreo in ROOT
			} else {
				await store.remove({view, anim})
				await store.add({ view, index, anim })
			}
		},

		/** sostituisco tutti i DOC con quelli ricavati da una stringa (tipicamente URL) */
		updateFromString(docsStr: string, store?: DocStore) {
			const viewsState = stringToViewsState(docsStr)
			const stores = viewsState.map(viewState => buildStore(viewState)).filter(store => !!store)
			const storesAgg = aggregate(stores)
			store.setAll(storesAgg)
		},
	},

	mutators: {
		setAll: (all: ViewStore[], store?: DocStore) => {
			const views: ViewStore[] = disgregate(all)
			navSo.setParams(["docs", viewsToString(views)])
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


