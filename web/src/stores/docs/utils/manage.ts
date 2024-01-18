import { ViewStore } from "../../stacks/viewBase";



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
		if (view.state.uuid === id) {
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