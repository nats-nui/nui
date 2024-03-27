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



window.addEventListener("load", async (event) => StartSession())
window.addEventListener("beforeunload", async (event) => EndSession())
window.onerror = (message, url, line, col, error) => {
	logSo.addError(error)
}

export async function EndSession() {
	const dockViews = docsSo.state.all
	const menuViews = docsSo.state.menu
	const dockStates = dockViews.map(store => store.getSerialization())
	const menuStates = menuViews
		.filter(viewMenu => !docsSo.getById(viewMenu.state.uuid))
		.map(store => store.getSerialization())
	const menuUuids: string[] = menuViews.map((view) => view.state.uuid)
	const dockUuids: string[] = dockViews.map((view) => view.state.uuid)
	await dbSave([
		logSo.state.all ?? [],
		menuUuids,
		dockUuids,
		[...dockStates, ...menuStates],
	])
}

export async function StartSession() {

	// altrimenti MSW non funziona
	if ( import.meta.env.DEV ) await delay(1000)

	// LOAD FROM INDEXED-DB
	const records = await dbLoad()
	const [log, menuUuids, dockUuids, states] = records
	logSo.setAll(log ?? [])

	const dockStates: any[] = dockUuids?.map(uuid => states.find(s => s.uuid == uuid)).filter(s => !!s) ?? []
	const dockStores = dockStates.map(state => {
		const store: ViewStore = buildStore({ type: state.type })
		store?.setSerialization(state)
		return store
	}).filter(s => !!s)

	const menuStates: any[] = menuUuids?.map(uuid => states.find(s => s.uuid == uuid)).filter(s => !!s) ?? []
	const menuStores = menuStates.map(state => {
		const store = buildStore({ type: state.type })
		store?.setSerialization(state)
		return store
	}).filter(s => !!s)

	// BUILD SINGLETONE CARDS
	// docsSo.state.connView = (docsSo.find({ type: DOC_TYPE.CONNECTIONS }) ?? buildStore({ type: DOC_TYPE.CONNECTIONS })) as CnnListStore
	// docsSo.state.logsView = (docsSo.find({ type: DOC_TYPE.LOGS }) ?? buildStore({ type: DOC_TYPE.LOGS })) as ViewLogStore
	docsSo.state.connView = (dockStores.find(s => s.state.type == DOC_TYPE.CONNECTIONS) ?? buildStore({ type: DOC_TYPE.CONNECTIONS })) as CnnListStore
	docsSo.state.logsView = (dockStores.find(s => s.state.type == DOC_TYPE.LOGS) ?? buildStore({ type: DOC_TYPE.LOGS })) as ViewLogStore

	// LOAD ALL CONNECTIONS
	await cnnSo.fetch()

	docsSo.setAll(dockStores)
	docsSo.setMenu(menuStores)

	logSo.add({ body: "STARTUP NUI - load session" })
}