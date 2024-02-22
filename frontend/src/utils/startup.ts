import docsSo from "@/stores/docs"
import { dbLoad, dbSave } from "@/utils/db"
import { buildStore } from "@/stores/docs/utils/factory"
import logSo from "@/stores/log"



window.addEventListener("load", async (event) => LoadSession())
window.addEventListener("beforeunload", async (event) => SaveSession())

export async function SaveSession() {
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

export async function LoadSession() {
	const records = await dbLoad()
	const [log, menuUuids, dockUuids, states] = records
	logSo.setAll(log)

	const dockStates = dockUuids.map(uuid => states.find(s => s.uuid == uuid)).filter(s => !!s)
	const dockStores = dockStates.map(state => {
		const store = buildStore({ type: state.type })
		store.setSerialization(state)
		return store
	})
	docsSo.setAll(dockStores)

	const menuStates = menuUuids.map(uuid => states.find(s => s.uuid == uuid)).filter(s => !!s)
	const menuStores = menuStates.map(state => {
		const store = buildStore({ type: state.type })
		store.setSerialization(state)
		return store
	})
	docsSo.setMenu(menuStores)

	logSo.add({ body: "STARTUP NUI - load session" })
}