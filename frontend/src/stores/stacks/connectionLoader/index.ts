import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import connectionApi from "@/api/connection"
import { CliImport } from "@/types"
import cnnSo from "../../connections"


/**
 * 
 */
const setup = {

	state: {
		title: "CNN.LOADER",
		subtitle: "...",
		path: <string>null,
		imports: <CliImport[]>null,

		//#region VIEWBASE
		width: 300,
		widthMax: 1000,
		//#endregion
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => (<CnnLoaderState>store?.state).title,
		getSubTitle: (_: void, store?: ViewStore): string => (<CnnLoaderState>store?.state).subtitle,

		//#endregion

	},

	actions: {

		import: async (_: void, store?: CnnLoaderStore) => {
			const { connections, imports } = await connectionApi.importFromNatsCli(store.state.path)
			store.setImports(imports)
			cnnSo.fetch()
		},

	},

	mutators: {
		setValue: (value: string) => ({ value }),
		setPath: (path: string) => ({ path }),
		setImports: (imports: CliImport[]) => ({ imports }),
	},
}

export type CnnLoaderState = typeof setup.state & ViewState
export type CnnLoaderGetters = typeof setup.getters
export type CnnLoaderActions = typeof setup.actions
export type CnnLoaderMutators = typeof setup.mutators
export interface CnnLoaderStore extends ViewStore, CnnLoaderGetters, CnnLoaderActions, CnnLoaderMutators {
	state: CnnLoaderState
}
const cnnLoaderSetup = mixStores(viewSetup, setup)
export default cnnLoaderSetup
