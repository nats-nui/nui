import { Log } from "@/stores/log/utils"
import { ViewState } from "@/stores/stacks/viewBase"
import { Session } from "./types"
import { DocState } from "@priolo/jack"



export function loadLocalStorage(): Session {
	let logs: Log[] = []
	let allStates: Partial<ViewState>[] = []
	let docsState: Partial<DocState> = {}
	let deckUuids: string[] = []
	let drawerUuids: string[] = []
	let menuUuids: string[] = []
	try {
		docsState = JSON.parse(localStorage.getItem("docs-state"))
		allStates = JSON.parse(localStorage.getItem("cards-all"))
		deckUuids = JSON.parse(localStorage.getItem("cards-deck-uuid"))
		drawerUuids = JSON.parse(localStorage.getItem("cards-drawer-uuid"))
		menuUuids = JSON.parse(localStorage.getItem("links-menu-uuid"))
		logs = JSON.parse(localStorage.getItem("logs"))
	} catch (e) { }
	return { allStates, deckUuids, docsState, drawerUuids, menuUuids, logs }
}

export function saveLocalStorage(session: Session) {
	localStorage.setItem("docs-state", JSON.stringify(session.docsState))
	localStorage.setItem("cards-all", JSON.stringify(session.allStates))
	localStorage.setItem("cards-deck-uuid", JSON.stringify(session.deckUuids))
	localStorage.setItem("cards-drawer-uuid", JSON.stringify(session.drawerUuids))
	localStorage.setItem("links-menu-uuid", JSON.stringify(session.menuUuids))
	try {
		localStorage.setItem("logs", JSON.stringify(session.logs))
	} catch (e) {
		console.error(e)
	}
}