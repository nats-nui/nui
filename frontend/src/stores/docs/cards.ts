import { DOC_ANIM } from "@/stores/docs/types"
import { delay, delayAnim } from "@/utils/time"
import { StoreCore, createStore, mixStores } from "@priolo/jon"
import { ViewStore } from "../stacks/viewBase"
import docsSo from "./index"
import { forEachViews, getById, getRoot } from "./utils/manage"



/**
 * gestisce un array di VIEWs
 */
const setup = {

	state: {
		/** tutte le CARD nel DECK */
		all: <ViewStore[]>[],
		/** CARD che ha il fuoco in questo momento */
		focus: <ViewStore>null,
	},

	getters: {
		getById(id: string, store?: CardsStore): ViewStore {
			if (!id) return null
			return getById(store.state.all, id)
		},
		getIndexByView(view: ViewStore, store?: CardsStore) {
			return store.state.all.findIndex(v => v == view)
		},
	},

	actions: {

		focus(view: ViewStore, store?: CardsStore) {
			const elm = document.getElementById(view?.state?.uuid)
			elm?.scrollIntoView({ behavior: "smooth", inline: "center" })
			store.setFocus(view)
		},

		/** aggiunge una CARD direttamente nel DECK */
		async add(
			{ view, index, anim = false }: { view: ViewStore, index?: number, anim?: boolean },
			store?: CardsStore
		) {
			// se c'e' gia' setto solo il focus
			const finded = getById(GetAllCards(), view.state.uuid)
			if (finded) {
				if (finded.state.group == drawerCardsSo) drawerCardsSo.setWidth(500)
				finded.state.group?.focus(finded)
				return
			}

			view.state.parent = null
			//view.state.group = store
			forEachViews([view], (v) => { v.state.group = store })
			const newViews = [...store.state.all]
			if (index == null) newViews.push(view); else newViews.splice(index, 0, view);

			store.setAll(newViews)

			if (anim && !view.state.docAniDisabled) {
				await delayAnim()
				await view.docAnim(DOC_ANIM.SHOWING)
			}
		},

		/** inserisco una CARD come link di un altra CARD */
		async addLink(
			{ view, parent, anim = false }: { view: ViewStore, parent: ViewStore, anim?: boolean },
			store?: CardsStore
		) {
			if (!parent) return

			// se c'e' gia' una view come LINK la rimuovo (stesso "size" della precedente)
			if (parent.state.linked) {
				if (!!view && !view.state.sizeForce) view.state.size = parent.state.linked.state.size
				await store.remove({ view: parent.state.linked, anim })
			}

			// gestione delle OPTIONS della CARDS
			if (!view) {
				delete docsSo.state.cardOptions[parent.state.type]
				return
			} else {
				docsSo.state.cardOptions[parent.state.type] = view.state.type
			}

			// imposto la view
			parent.setLinked(view)
			store.setAll([...store.state.all])

			// ANIMAZIONE
			if (anim && !parent.state.docAniDisabled) {
				//await delayAnim()
				await delay(100)
				await view.docAnim(DOC_ANIM.SHOWING)
			} else {
				view.setDocAnim(DOC_ANIM.SHOW)
			}

			// CALL EVENT
			view.onLinked()
		},

		/** inserisco una CARD nello STACK di un altra VIEW */
		async remove({ view, anim = false }: { view: ViewStore, anim?: boolean }, store?: CardsStore) {
			if (!view) return
			if (anim && !view.state.docAniDisabled) await view.docAnim(DOC_ANIM.EXITING)

			const views = [...store.state.all]
			let index: number

			// placed in ROOT
			if (!view.state.parent) {
				index = views.findIndex(v => v == view)
				if (index != -1) views.splice(index, 1)
				view.state.parent = null
				forEachViews([view], (v) => { v.state.group = null })
				// [II] view.state.group = null

				// LINKED
			} else {
				delete docsSo.state.cardOptions[view.state.parent.state.type]
				view.state.parent.setLinked(null)
			}

			store.setAll(views)
		},

		/** sposta una view in un indice preciso dello STACK */
		async move(
			{ view, index, groupDest, anim = false }: { view: ViewStore, index?: number, groupDest?: CardsStore, anim?: boolean },
			store?: CardsStore
		) {
			if (view == null) return
			if (index == null) index = 0
			if (!groupDest) groupDest = store
			const sameGroup = groupDest == store

			// se è direttamente in ROOT...
			if (view.state.parent == null) {
				const srcIndex = store.state.all.indexOf(view)
				if (sameGroup && (srcIndex == index || srcIndex + 1 == index)) return
				await store.remove({ view, anim })
				if (!sameGroup || srcIndex > index) {
					await groupDest.add({ view, index, anim })
				} else {
					await groupDest.add({ view, index: index - 1, anim })
				}

				// altrimenti la cancello e la ricreo in ROOT
			} else {
				await store.remove({ view, anim })
				await groupDest.add({ view, index, anim })
			}
		},

		/** stacca la CARD dal suo PARENT e la mette nella ROOT */
		detach(view: ViewStore, store?: CardsStore) {
			if (!view.state.parent) return
			const root = getRoot(view) ?? view
			const rootIndex = store.getIndexByView(root)
			store.move({ view, index: rootIndex + 1, anim: false })
		},

	},

	mutators: {
		setAll: (all: ViewStore[], store?: CardsStore) => ({ all }),
		setFocus: (focus: ViewStore) => ({ focus }),
	},
}

export type CardsState = typeof setup.state
export type CardsGetters = typeof setup.getters
export type CardsActions = typeof setup.actions
export type CardsMutators = typeof setup.mutators
export interface CardsStore extends StoreCore<CardsState>, CardsGetters, CardsActions, CardsMutators {
	state: CardsState
}

export const deckCardsSo = createStore(setup) as CardsStore

const setupDrawer = {
	state: {
		width: 0,
		/** indica che deve attivare l'animazione */
		animation: false,
		/** l'ultimo gap prima di chiuderlo */
		lastWidth: 500,
	},
	mutators: {
		setWidth: (width: number) => ({ width }),
	},
}
export type DrawerState = typeof setupDrawer.state & CardsState
type DrawerMutators = typeof setupDrawer.mutators
export interface DrawerStore extends CardsStore, StoreCore<DrawerState>, DrawerMutators { state: DrawerState }

export const drawerCardsSo = createStore(mixStores(setup, setupDrawer)) as DrawerStore

export const GetAllCards = () => [...deckCardsSo.state.all, ...drawerCardsSo.state.all]