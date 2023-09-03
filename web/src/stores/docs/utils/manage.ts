import { POSITION_TYPE } from "@/types";
import { ViewStore } from "../docBase";
import { getID } from "./factory";



/**
 * Permette di aggregare l'array di "docs" 
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
 * Disgrega un array di DocView in maniera da ottenere un array di Doc
 */
export function disgregate(docsView: ViewStore[]): ViewStore[] {
	let views: ViewStore[] = []
	forEachDocsView(docsView, (docView) => views.push(docView))
	// elimino le VIEW temporanee
	views = views.filter(view => !view.state.temporary)
	return views
}

/**
 * Cicla tutti i docs di questo array compresi i children
 */
export function forEachDocsView(view: ViewStore[], callback: (view: ViewStore) => any): boolean {
	if (!view) return
	for (const v of view) {
		if (forEachDocView(v, callback) === true) return true
	}
}

function forEachDocView(view: ViewStore, callback: (view: ViewStore) => any): boolean {
	if (!view) return
	if (callback(view) === true) return true
	if (view.state.stacked) {
		for (const v of view.state.stacked) if (callback(v) === true) return true
	}
	if (view.state.linked) {
		return forEachDocView(view.state.linked, callback)
	}
}

/** recupera una VIEW traite l'id del DOC che è contenuto */
export function getById(docsView: ViewStore[], id: string): ViewStore {
	let finded: ViewStore = null
	forEachDocsView(docsView, (docView) => {
		if (getID(docView.state) === id) {
			finded = docView
			return true
		}
	})
	return finded
}


/** cicla tutti i parent di questo doc-view */
export function forEachParent(view: ViewStore, callback: (view: ViewStore) => void): void {
	let parent = view?.state.parent
	while (parent != null) {
		callback(parent)
		parent = parent.state.parent
	}
}
/** Restituisce il deep di una view rispetto i suoi parents */
export function numLinkedParent(view: ViewStore): number {
	let count = 0
	forEachParent(view, () => count++)
	return count
}


