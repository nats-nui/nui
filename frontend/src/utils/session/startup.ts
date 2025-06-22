import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { deckCardsSo, drawerCardsSo } from "@/stores/docs/cards"
import { menuSo } from "@/stores/docs/links"
import { buildStore } from "@/stores/docs/utils/factory"
import logSo from "@/stores/log"
import { AboutStore } from "@/stores/stacks/about"
import { CnnListStore } from "@/stores/stacks/connection"
import { HelpStore } from "@/stores/stacks/help"
import { ViewLogStore } from "@/stores/stacks/log"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { utils } from "@priolo/jack"
import { delay } from "../time"
import { loadLocalStorage, saveLocalStorage } from "./storage"
import { Session } from "./types"
import { shortcutStart } from "./shortcut"



window.addEventListener("load", async (event) => LoadSession())
window.addEventListener("beforeunload", async (event) => SaveSession())
window.onerror = (message, url, line, col, error) => {
	logSo.addError(error)
}

export async function SaveSession() {
	const deckStates = deckCardsSo.state.all.map(store => store.getSerialization())
	const drawerStates = drawerCardsSo.state.all.map(store => store.getSerialization())
	const menuStates = menuSo.state.all.reduce((acc, store) => {
		if (utils.forEachViews(docsSo.getAllCards(), (v) => v.state.uuid == store.state.uuid)) return acc
		return [...acc, store.getSerialization()]
	}, [])
	const docsState = docsSo.getSerialization()
	const session: Session = {
		allStates: [...deckStates, ...drawerStates, ...menuStates],
		docsState,
		deckUuids: deckStates.map(s => s.uuid),
		drawerUuids: drawerStates.map(s => s.uuid),
		menuUuids: menuSo.state.all.map(store => store.state.uuid),
		logs: logSo.state.all,
	}
	saveLocalStorage(session)
}
 
export async function LoadSession() {

	// altrimenti MSW non funziona
	if (import.meta.env.DEV) await delay(1000)

	const session = loadLocalStorage()
	docsSo.setSerialization(session.docsState)
	const { deckStores, drawerStores, menuStores } = buildCards(session)
	const allStores = [...deckStores, ...drawerStores, ...menuStores]

	// BUILD SINGLETONE CARDS
	buildFixedCards(allStores)

	// LOAD ALL CONNECTIONS
	await cnnSo.fetch()

	deckCardsSo.setAll(deckStores)
	drawerCardsSo.setAll(drawerStores)
	menuSo.setAll(menuStores)

	logSo.add({ body: "STARTUP NUI - load session" })

	shortcutStart()
}

export function ClearSession() {
	localStorage.removeItem("logs")
	localStorage.removeItem("cards-all")
	localStorage.removeItem("cards-deck-uuid")
	localStorage.removeItem("cards-drawer-uuid")
	localStorage.removeItem("links-menu-uuid")
}

function buildCards(session: Session) {

	// LOGS
	logSo.setAll(session.logs ?? [])

	// DECK
	const deckStates = session.deckUuids?.map(uuid => session.allStates.find(s => s.uuid == uuid))
	const deckStores = deckStates?.map(state => {
		const store: ViewStore = buildStore({ type: state.type, group: deckCardsSo }, state)
		return store
	}).filter(s => !!s) ?? []

	// DRAWER
	const drawerStates = session.drawerUuids?.map(uuid => session.allStates.find(s => s.uuid == uuid))
	const drawerStores = drawerStates?.map(state => {
		const store: ViewStore = buildStore({ type: state.type, group: drawerCardsSo }, state)
		return store
	}).filter(s => !!s) ?? []

	// MENU
	const menuStores = session.menuUuids?.map(uuid => {
		let store: ViewStore = utils.forEachViews([...deckStores, ...drawerStores], (v) => v.state.uuid == uuid ? v : null)
		if (!store) {
			const state = session.allStates.find(s => s.uuid == uuid)
			store = state ? buildStore({ type: state.type }, state) : null
		}
		return store
	}).filter(s => !!s) ?? []

	return { deckStores, drawerStores, menuStores }
}

function buildFixedCards(allStores: ViewStore[]) {
	const fixedCnn = (allStores.find(s => s.state.type == DOC_TYPE.CONNECTIONS) ?? buildStore({ type: DOC_TYPE.CONNECTIONS })) as CnnListStore
	const fixedLogs = (allStores.find(s => s.state.type == DOC_TYPE.LOGS) ?? buildStore({ type: DOC_TYPE.LOGS })) as ViewLogStore
	const fixedAbout = (allStores.find(s => s.state.type == DOC_TYPE.ABOUT) ?? buildStore({ type: DOC_TYPE.ABOUT })) as AboutStore
	const fixedHelp = buildStore({ type: DOC_TYPE.HELP }) as HelpStore
	docsSo.setFixedViews([fixedCnn, fixedLogs, fixedAbout, fixedHelp])
}