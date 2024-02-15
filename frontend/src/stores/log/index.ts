import docSo from "@/stores/docs"
import { StoreCore, createStore } from "@priolo/jon"
import { MESSAGE_TYPE, Log } from "./utils"



const setup = {

	state: {
		all: <Log[]>[],
	},

	getters: {
	},

	actions: {
		add(log: Log, store?: LogStore) {
			if (!log.type) log.type = MESSAGE_TYPE.INFO
			log.receivedAt = Date.now()
			if (log.targetId) {
				const view = docSo.getById(log.targetId)
				view.setSnackbar({
					open: true, 
					type: log.type,
					title: log.title,
					body: log.body,
				})
			}
			store.setAll([...store.state.all, log])
		},
		clear(_:void, store?:LogStore) {
			store.setAll([])
		}
	},

	mutators: {
		setAll: (all: Log[]) => ({ all }),
	},
}

export type LogState = typeof setup.state
export type LogGetters = typeof setup.getters
export type LogActions = typeof setup.actions
export type LogMutators = typeof setup.mutators
export interface LogStore extends StoreCore<LogState>, LogGetters, LogActions, LogMutators {
	state: LogState
}
const logStore = createStore(setup) as LogStore
export default logStore
