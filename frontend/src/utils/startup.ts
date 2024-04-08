import docsSo from "@/stores/docs"
import { buildStore } from "@/stores/docs/utils/factory"
import logSo from "@/stores/log"
import { dbLoad, dbSave } from "@/utils/db"
import cnnSo from "@/stores/connections"
import { DOC_TYPE } from "@/types"
import { ViewLogStore } from "@/stores/stacks/log"
import { CnnListStore } from "@/stores/stacks/connection"
import { ViewStore } from "@/stores/stacks/viewBase"
import { delay } from "./time"
import { deckCardsSo, drawerCardsSo, menuCardsSo } from "@/stores/docs/cards"
import { Log } from "@/stores/log/utils"



window.addEventListener("load", async (event) => StartSession())
window.addEventListener("beforeunload", async (event) => EndSession())
window.onerror = (message, url, line, col, error) => {
	logSo.addError(error)
}

export async function EndSession() {
	const deckStates = deckCardsSo.state.all.map(store => store.getSerialization())
	const menuStates = menuCardsSo.state.all.map(store => store.getSerialization())
	const drawerStates = drawerCardsSo.state.all.map(store => store.getSerialization())
	await dbSave([
		logSo.state.all ?? [],
		deckStates,
		menuStates,
		drawerStates,
	])
}

export async function StartSession() {

	// altrimenti MSW non funziona
	if (import.meta.env.DEV) await delay(1000)

	// LOAD FROM INDEXED-DB
	const records = await dbLoad()
	const [log, deckStates, menuStates, drawerStates] = records as [Log[], any[], any[], any[]]

	logSo.setAll(log ?? [])

	// CREAZIONE delle CARDS
	const deckStores = deckStates?.map(state => {
		const store: ViewStore = buildStore({ type: state.type, group: deckCardsSo })
		store?.setSerialization(state)
		return store
	}).filter(s => !!s) ?? []

	const menuStores = menuStates?.map(state => {
		const store = buildStore({ type: state.type, group: menuCardsSo })
		store?.setSerialization(state)
		return store
	}).filter(s => !!s) ?? []

	const drawerStores = drawerStates?.map(state => {
		const store = buildStore({ type: state.type, group: drawerCardsSo })
		store?.setSerialization(state)
		return store
	}).filter(s => !!s) ?? []

	// BUILD SINGLETONE CARDS
	// [II] bisogna cercare su tutte le CARD in menu deck e drawer
	docsSo.state.connView = (deckStores.find(s => s.state.type == DOC_TYPE.CONNECTIONS) ?? buildStore({ type: DOC_TYPE.CONNECTIONS })) as CnnListStore
	docsSo.state.logsView = (deckStores.find(s => s.state.type == DOC_TYPE.LOGS) ?? buildStore({ type: DOC_TYPE.LOGS })) as ViewLogStore

	// LOAD ALL CONNECTIONS
	await cnnSo.fetch()

	deckCardsSo.setAll(deckStores)
	menuCardsSo.setAll(menuStores)
	drawerCardsSo.setAll(drawerStores)

	logSo.add({ body: "STARTUP NUI - load session" })
}