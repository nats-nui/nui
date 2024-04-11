import { StoreCore, createStore } from "@priolo/jon"
import { deckCardsSo, drawerCardsSo } from "../docs/cards"
import { Log, MESSAGE_TYPE } from "./utils"



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
				// [II] TODO
				const view = deckCardsSo.getById(log.targetId) || drawerCardsSo.getById(log.targetId)
				view?.setSnackbar({
					open: true,
					type: log.type,
					title: log.title,
					body: log.body,
				})
			}
			store.setAll([...store.state.all, log])
		},
		addError(error: Error, store?: LogStore) {
			if (!error) return
			store.add({
				type: MESSAGE_TYPE.ERROR,
				title: error.message,
				body: error.stack,
			})
			console.error(error)
		},
		clear(_: void, store?: LogStore) {
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
