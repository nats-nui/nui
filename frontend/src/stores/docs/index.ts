import { DOC_ANIM, DOC_TYPE } from "@/stores/docs/types"
import { deepEqual } from "@/utils/object"
import { delay, delayAnim } from "@/utils/time"
import { StoreCore, createStore } from "@priolo/jon"
import { ViewStore } from "../stacks/viewBase"
import { forEachViews, getById } from "./utils/manage"



/**
 * Gestisce la lista di DOCS presenti
 */
const setup = {

	state: {
		focus: <ViewStore>null,
		all: <ViewStore[]>[],
		menu: <ViewStore[]>[],
		anchored: 0,

		cardOptions: <{ [type: string]: DOC_TYPE }>{},
	},

	getters: {
		getById(id: string, store?: DocStore): ViewStore {
			if (!id) return null
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
		isPinned(uuid: string, store?: DocStore) {
			return store.state.menu.some(view => view.state.uuid == uuid)
		},
		find(state: any, store?: DocStore) {
			return forEachViews(
				store.state.all,
				(view) => deepEqual(state, view.state) ? view : null
			)
		}
	},

	actions: {
		focus(view: ViewStore, store?: DocStore) {
			const elm = document.getElementById(view?.state?.uuid)
			elm?.scrollIntoView({ behavior: "smooth", inline: "center" })
			store.setFocus(view)
		},
		/** aggiunge una CARD direttamente nel DECK */
		async add(
			{ view, index, anim = false }: { view: ViewStore, index?: number, anim?: boolean },
			store?: DocStore
		) {
			// se c'e' gia' setto solo il focus
			if (forEachViews(store.state.all, (v) => v.state.uuid == view.state.uuid)) {
				store.setFocus(view)
				return
			}
			view.state.parent = null
			const newViews = [...store.state.all]
			if (index == null) newViews.push(view); else newViews.splice(index, 0, view);
			if (index < store.state.anchored) {
				store.state.anchored++
			}

			store.setAll(newViews)

			if (anim && !view.state.docAniDisabled) {
				await delayAnim()
				await view.docAnim(DOC_ANIM.SHOWING)
			}
		},

		/** inserisco una CARD come link di un altra CARD */
		async addLink(
			{ view, parent, anim = false }: { view: ViewStore, parent: ViewStore, anim?: boolean },
			store?: DocStore
		) {
			if (!parent) return

			// se c'e' gia' una view la rimuovo (stesso "size" della precedente)
			if (parent.state.linked) {
				if (!!view && !view.state.sizeForce) view.state.size = parent.state.linked.state.size
				await store.remove({ view: parent.state.linked, anim })
			}
			if (!view) {
				delete store.state.cardOptions[parent.state.type]
				return
			} else {
				store.state.cardOptions[parent.state.type] = view.state.type
			}

			// imposto la view
			parent.setLinked(view)
			store.setAll([...store.state.all])

			if (anim && !parent.state.docAniDisabled) {
				//await delayAnim()
				await delay(100)
				await view.docAnim(DOC_ANIM.SHOWING)
			} else {
				view.setDocAnim(DOC_ANIM.SHOW)
			}
		},

		/** inserisco una CARD nello STACK di un altra VIEW */
		async remove({ view, anim = false }: { view: ViewStore, anim?: boolean }, store?: DocStore) {
			if (!view) return
			if (anim && !view.state.docAniDisabled) await view.docAnim(DOC_ANIM.EXITING)

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

				// LINKED
			} else {
				delete store.state.cardOptions[view.state.parent.state.type]
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
		async pinned(view: ViewStore, store?: DocStore) {
			if (!view) return
			store.setMenu([...store.state.menu, view])
		},
		/** rende mobile una VIEW fissata */
		async unpinned(view: ViewStore, store?: DocStore) {
			if (!view) return
			const menu = [...store.state.menu]
			const index = menu.findIndex(s => s == view)
			if (index == -1) return
			menu.splice(index, 1)
			store.setMenu(menu)
		},
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
const docsSo = createStore(setup) as DocStore
export default docsSo


