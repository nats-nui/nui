import connectionApi from "@/api/connection"
import docsSo from "@/stores/docs"
import docSetup, { ViewState, ViewStore } from "@/stores/docs/docBase"

import { DOC_TYPE } from "@/types"
import { Connection } from "@/types/Connection"
import { StoreCore, mixStores } from "@priolo/jon"
import { initView } from "../docs/utils/factory"
import superDoc from "@/stores/docs/docBase"



export enum CONNECTIONS_PARAMS {
	SELECT = "slc"
}

const setup = {

	state: {
		all: <Connection[]>null,
		params: {
			[CONNECTIONS_PARAMS.SELECT]: <string[]>null
		}
	},

	getters: {
		getById(id: string, store?: ConnectionStore) {
			return store.state.all?.find(cnn => cnn.id == id)
		},
		getSelectIndex(_: void, store?: ConnectionStore) {
			const index = Number(superDoc.getters.getParam(CONNECTIONS_PARAMS.SELECT, store))
			return Number.isNaN(index) ? -1 : index
		},
		getSelect(_: void, store?: ConnectionStore) {
			const index = store.getSelectIndex()
			return index == -1 ? null : store.state.all?.[index]
		},
	},

	actions: {
		async fetch(_: void, store?: ConnectionStore) {
			const { data: connections } = await connectionApi.index()
			store.setAll(connections)
		},
		select(cnn: Connection, store?: ConnectionStore) {
			const index = store.state.all.indexOf(cnn)
			store.setSelectIndex(index)
			const srvStore = initView({
				uuid: cnn.id,
				type: DOC_TYPE.SERVICES,
			})
			docsSo.addLink({
				view: srvStore,
				parent: store,
			})
		},
	},

	mutators: {
		setAll: (all: Connection[]) => ({ all }),
		setSelectIndex: (select: number, store?: ConnectionStore) => {
			return superDoc.mutators.setParams({ [CONNECTIONS_PARAMS.SELECT]: [select.toString()] }, store)
		},
		updateSelected: (connection: Connection, store?: ConnectionStore) => {
			const index = store.getSelectIndex()
			if (index == -1) return
			const all = [...store.state.all]
			all[index] = connection
			return { all }
		}
	},
}

export type ConnectionState = typeof setup.state & ViewState
export type ConnectionGetters = typeof setup.getters
export type ConnectionActions = typeof setup.actions
export type ConnectionMutators = typeof setup.mutators
export interface ConnectionStore extends ViewStore, StoreCore<ConnectionState>, ConnectionGetters, ConnectionActions, ConnectionMutators {
	state: ConnectionState
}
const cnnSetup = mixStores(docSetup, setup)
export default cnnSetup


