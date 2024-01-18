import { POSITION_TYPE } from "@/types";
import { ViewStore } from "../../stacks/viewBase";
import { getID } from "./factory";



/**
 * Permette di aggregare l'array di VIEWs
 * in una struttura ad albero
 */
export function aggregate(views: ViewStore[]): ViewStore[] {
	if (!views) return []
	let lastParent: ViewStore
	return views.reduce((acc: ViewStore[], view) => {
		if (view.state.position == POSITION_TYPE.DETACHED) {
			lastParent = view
			return acc.concat(lastParent)
		}
		if (view.state.position == POSITION_TYPE.LINKED) {
			view.state.parent = lastParent
			lastParent.state.linked = view
			lastParent = view
		}
		return acc
	}, [])
}

/**
 * Disgrega un array di ViewStore 
 * in maniera da ottenere un array di VIEWs
 */
export function disgregate(docsView: ViewStore[]): ViewStore[] {
	let views: ViewStore[] = []
	forEachDocsView(docsView, (docView) => views.push(docView))
	return views
}

/**
 * Cicla tutte le VIEWs di un array compresi i children
 * se il callback restituisce true allora termina
 */
export function forEachDocsView(views: ViewStore[], callback: (view: ViewStore) => any): boolean {
	if (!views) return
	for (const view of views) {
		if (forEachDocView(view, callback) === true) return true
	}
}
function forEachDocView(view: ViewStore, callback: (view: ViewStore) => any): boolean {
	if (!view) return
	if (callback(view) === true) return true
	if (view.state.linked) {
		return forEachDocView(view.state.linked, callback)
	}
}

/** 
 * restituisce una VIEW tramite l'id cercando nei "child" in un array di VIEW 
 */
export function getById(views: ViewStore[], id: string): ViewStore {
	let finded: ViewStore = null
	forEachDocsView(views, (view) => {
		if (getID(view.state) === id) {
			finded = view
			return true
		}
	})
	return finded
}

/** 
 * cicla tutti i parent di "view" 
 */
export function forEachParent(view: ViewStore, callback: (view: ViewStore) => void): void {
	let parent = view?.state.parent
	while (parent != null) {
		callback(parent)
		parent = parent.state.parent
	}
}

/** 
 * Restituisce il deep di una view rispetto i suoi parents 
 */
export function numLinkedParent(view: ViewStore): number {
	let count = 0
	forEachParent(view, () => count++)
	return count
}

/**
 * restituisce il PARENT in STACK d una VIEW
 */
export function getRoot(view: ViewStore): ViewStore {
	let parent: ViewStore = null
	forEachParent(view, (p) => parent = p)
	return parent
}