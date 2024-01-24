import { ViewStore } from "../../stacks/viewBase";



/**
 * Cicla tutte le VIEWs di un array compresi i children
 * se il callback restituisce un valore allora termina e restituisce il valore 
 * se il callback restituisce null continua
 */
export function forEachDocsView<T>(views: ViewStore[], callback: (view: ViewStore) => T): T {
	if (!views) return null
	for (const view of views) {
		const ret = forEachDocView(view, callback)
		if ( ret != null) return ret
	}
	return null
}
function forEachDocView<T>(view: ViewStore, callback: (view: ViewStore) => T): T {
	if (!view) return null
	const ret = callback(view)
	if ( ret != null ) return ret
	if (view.state.linked) {
		return forEachDocView(view.state.linked, callback)
	}
	return null
}

/** 
 * restituisce una VIEW tramite l'id cercando nei "child" in un array di VIEW 
 */
export function getById(views: ViewStore[], id: string): ViewStore {
	return forEachDocsView(views, (view) => {
		if (view.state.uuid === id) {
			return view
		}
	})
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