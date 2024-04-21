import { deepEqual } from "@/utils/object";
import { ViewStore } from "../../stacks/viewBase";



/**
 * Cicla tutte le VIEWs di un array compresi i children
 * se il callback restituisce un valore allora termina e restituisce il valore 
 * se il callback restituisce null continua
 */
export function forEachViews<T>(views: ViewStore[], callback: (view: ViewStore) => T): T {
	if (!views) return null
	for (const view of views) {
		const ret = forEachView(view, callback)
		if ( ret != null) return ret
	}
	return null
}
function forEachView<T>(view: ViewStore, callback: (view: ViewStore) => T): T {
	if (!view) return null
	const ret = callback(view)
	if ( ret != null && ret !== false ) return ret
	if (view.state.linked) {
		return forEachView(view.state.linked, callback)
	}
	return null
}

/** 
 * restituisce una VIEW tramite l'id cercando nei "child" in un array di VIEW 
 * in pratica è un findAll specializzato sull'id
 */
export function getById(views: ViewStore[], id: string): ViewStore {
	return forEachViews(views, (view) => {
		if (view.state.uuid === id) {
			return view
		}
	})
}

/** cerca su tutte le CARD (anche i children) */
export function findAll(views: ViewStore[], state: any) {
	const ret: ViewStore[] = []
	forEachViews(
		views,
		(view) => {
			if (deepEqual(state, view.state)) ret.push(view)
		}
	)
	return ret
}

/** cerca nel DECK solo le CARD senza parent */
export function findInRoot(views: ViewStore[], state: any) {
	return forEachViews(
		views,
		(view) => deepEqual(state, view.state) ? view : null
	)
}


/**
 * cicla i parent se c'e' un return si ferma e restituisce
 */
export function findParent<T>(view: ViewStore, callback: (view: ViewStore) => T): T {
	let parent = view?.state.parent
	while (parent != null) {
		const ret = callback(parent)
		if ( ret != null && ret !== false ) return ret
		parent = parent.state.parent
	}
	return null
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

