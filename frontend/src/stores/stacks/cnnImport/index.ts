import connectionApi from "@/api/connection"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { CliImport } from "@/types"
import { mixStores } from "@priolo/jon"
import cnnSo from "../../connections"
import { MESSAGE_TYPE } from "@/stores/log/utils"



export enum IMPORT_STATUS {
	INIT = "INIT",
	LOADING = "LOADING",
	DONE = "DONE",
	ERROR = "ERROR",
}

/**
 * 
 */
const setup = {

	state: {
		title: "IMPORT",
		subtitle: "all files found in a directory",
		path: <string>null,
		imports: <CliImport[]>null,
		status: <IMPORT_STATUS>null,
		dialog: <Dialog>{ open: false, imp: null },

		//#region VIEWBASE
		width: 230,
		widthMax: 1000,
		//#endregion
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => (<CnnImportState>store?.state).title,
		getSubTitle: (_: void, store?: ViewStore): string => (<CnnImportState>store?.state).subtitle,

		//#endregion

	},

	actions: {

		import: async (_: void, store?: CnnImportStore) => {
			store.setStatus(IMPORT_STATUS.LOADING)
			try {
				const { connections, imports } = await connectionApi.importFromNatsCli(store.state.path, { store })
				store.setStatus(IMPORT_STATUS.DONE)
				store.setImports(imports)
				cnnSo.fetch()
				store.setSnackbar({
					open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
					title: "IMPORTED",
					body: "the action has been performed",
				})
			} catch (e) {
				store.setStatus(IMPORT_STATUS.ERROR)
			}
		},

	},

	mutators: {
		setValue: (value: string) => ({ value }),
		setPath: (path: string) => ({ path }),
		setImports: (imports: CliImport[]) => ({ imports }),
		setStatus: (status: IMPORT_STATUS) => ({ status }),
		setDilaog: (dialog: Dialog) => ({ dialog }),
	},
}

export type CnnImportState = typeof setup.state & ViewState
export type CnnImportGetters = typeof setup.getters
export type CnnImportActions = typeof setup.actions
export type CnnImportMutators = typeof setup.mutators
export interface CnnImportStore extends ViewStore, CnnImportGetters, CnnImportActions, CnnImportMutators {
	state: CnnImportState
}
const cnnImportSetup = mixStores(viewSetup, setup)
export default cnnImportSetup

export type Dialog = {
	open: boolean
	imp: CliImport
}