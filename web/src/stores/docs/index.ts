import { DOC_ANIM, POSITION_TYPE } from "@/stores/docs/types"
import { delayAnim } from "@/utils/time"
import { StoreCore, createStore } from "@priolo/jon"
import { ViewStore } from "../stacks/viewBase"
import { buildStore, getID } from "./utils/factory"
import { getById } from "./utils/manage"
import { dbLoad, dbSave } from "./utils/db"
import { VIEW_SIZE } from "../stacks/utils"



/**
 * Gestisce la lista di DOCS presenti
 */
const setup = {

	state: {
		focus: <ViewStore>null,
		all: <ViewStore[]>[],
		menu: <ViewStore[]>[],
		anchored: 0,
	},

	getters: {
		getById(id: string, store?: DocStore): ViewStore {
			return getById(store.state.all, id)
		},
		getIndexByView(view: ViewStore, store?: DocStore) {
			return store.state.all.findIndex(v => v == view)
		},
		isAnchored(view: ViewStore, store?: DocStore) {
			const index = store.getIndexByView(view)
			return index < store.state.anchored
		},
		getVisible(_: void, store?: DocStore) {
			return store.state.all
				//.filter(s => s.state.size != VIEW_SIZE.ICONIZED)
				.slice(store.state.anchored)
		},
		getAnchored(_: void, store?: DocStore) {
			return store.state.all
				//.filter(s => s.state.size != VIEW_SIZE.ICONIZED)
				.slice(0, store.state.anchored)
		},
		// getIconized(_: void, store?: DocStore) {
		// 	return store.state.all
		// 		.filter(s => s.state.size == VIEW_SIZE.ICONIZED)
		// },
	},

	actions: {
		focus(view: ViewStore, store?: DocStore) {
			const elm = document.getElementById(getID(view.state))
			elm?.scrollIntoView({ behavior: "smooth", inline: "center" })
			store.setFocus(view)
		},
		async add(
			{ view, index, anim = false }: { view: ViewStore, index?: number, anim?: boolean },
			store?: DocStore
		) {
			view.state.parent = null
			view.state.position = POSITION_TYPE.DETACHED
			const newViews = [...store.state.all]
			if (index == null) newViews.push(view); else newViews.splice(index, 0, view);
			if (index < store.state.anchored) {
				store.state.anchored++
			}

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
				await store.remove({ view: parent.state.linked, anim })
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
		async remove({ view, anim = false }: { view: ViewStore, anim?: boolean }, store?: DocStore) {
			if (anim) await view.docAnim(DOC_ANIM.EXITING)

			const views = [...store.state.all]
			let index: number

			// placed in ROOT
			if (!view.state.parent) {
				index = views.findIndex(v => v == view)
				if (index < store.state.anchored) {
					store.state.anchored--
				}
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
		async move({ view, index, anim = false }: { view: ViewStore, index: number, anim?: boolean }, store?: DocStore) {
			if (view == null || index == null) return
			// se è direttamente in ROOT...
			if (view.state.parent == null) {
				const srcIndex = store.state.all.indexOf(view)
				if (srcIndex == index || srcIndex + 1 == index) return
				await store.remove({ view, anim })
				if (srcIndex > index) {
					await store.add({ view, index, anim })
				} else {
					await store.add({ view, index: index - 1, anim })
				}
				// altrimenti la cancello e la ricreo in ROOT
			} else {
				await store.remove({ view, anim })
				await store.add({ view, index, anim })
			}
		},

		/** fissa una VIEW al lato sinistro */
		async anchor(view: ViewStore, store?: DocStore) {
			if (!view) return
			const storeIndex = store.getIndexByView(view)
			const index = store.state.anchored
			await store.move({ view, index })
			if (storeIndex >= index) store.state.anchored++
			store._update()
		},
		/** rende mobile una VIEW fissata */
		async unanchor(view: ViewStore, store?: DocStore) {
			if (!view) return
			const storeIndex = store.getIndexByView(view)
			const index = store.state.anchored
			await store.move({ view, index })
			if (storeIndex == index - 1) store.state.anchored--
			store._update()
		},

		/** fissa una VIEW al lato sinistro */
		async iconize(view: ViewStore, store?: DocStore) {
			if (!view) return
			//view.state.size = VIEW_SIZE.ICONIZED
			//await store.remove({ view, anim: true })
			store.setMenu([...store.state.menu, view])
		},
		/** rende mobile una VIEW fissata */
		async uniconize(view: ViewStore, store?: DocStore) {
			if (!view) return
			//view.state.size = VIEW_SIZE.NORMAL
			//store.add({ view, anim: true })
			const menu = [...store.state.menu]
			const index = menu.findIndex( s => s == view)
			if ( index == -1 ) return
			menu.splice( index, 1 )
			store.setMenu(menu)
		},




		/** sostituisco tutti i DOC con quelli ricavati da una stringa (tipicamente URL) */
		// updateFromString(docsStr: string, store?: DocStore) {
		// 	const viewsState = stringToViewsState(docsStr)
		// 	const stores = viewsState.map(viewState => buildStore(viewState)).filter(store => !!store)
		// 	const storesAgg = aggregate(stores)
		// 	store.setAll(storesAgg)
		// },
	},

	mutators: {
		setAll: (all: ViewStore[], store?: DocStore) => ({ all }),
		setMenu: (menu: ViewStore[], store?: DocStore) => ({ menu }),
		setFocus: (focus: ViewStore) => ({ focus }),
		setAnchored: (anchored: number) => ({ anchored }),
	},
}

export type DocState = typeof setup.state
export type DocGetters = typeof setup.getters
export type DocActions = typeof setup.actions
export type DocMutators = typeof setup.mutators
export interface DocStore extends StoreCore<DocState>, DocGetters, DocActions, DocMutators {
	state: DocState
}
const docsStore = createStore(setup) as DocStore
export default docsStore



//var decodedQueryString = decodeURIComponent(window.location.search.substring(1));
//navSo.setQuery(decodedQueryString)
//const docsStr = navSo.getSearchUrl("docs") as string
//store.updateFromString(docsStr)



// async function load() {
// 	const states = await dbLoad()
// 	const stores: ViewStore[] = states.map(state => buildStore(state))
// 	docsStore.setAll(stores)
// }
// load()

window.addEventListener("load", async (event) => {
	const states = await dbLoad()
	const stores = states.map(state => {
		const store = buildStore({ type: state.type })
		store.setSerialization(state)
		return store
	})
	docsStore.setAll(stores)
})

window.addEventListener("beforeunload", async (event) => {
	const states = docsStore.state.all.map(store => store.getSerialization())
	await dbSave(states)
})
