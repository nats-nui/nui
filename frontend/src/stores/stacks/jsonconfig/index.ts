import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"



const setup = {

	state: {
		title: "JSON CONFIG",
		subtitle: "...and then write it directly in JSON!",
		value: <string>null,
		onClose: <(json?: string) => void>null,

		//#region VIEWBASE
		width: 420,
		widthMax: 1000,
		//#endregion
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => (<JsonConfigState>store?.state).title,
		getSubTitle: (_: void, store?: ViewStore): string => (<JsonConfigState>store?.state).subtitle,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as JsonConfigState
			return {
				...viewSetup.getters.getSerialization(null, store),
				json: state.value,
			}
		},

		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as JsonConfigState
			state.value = data.json
		},
		//#endregion

		onRemoveFromDeck: (_: void, store?: ViewStore) => {
			viewSetup.actions.onRemoveFromDeck(null, store)
			const configStore = store as JsonConfigStore
			configStore.state.onClose?.()
		},

		save: (_: void, store?: JsonConfigStore) => {
			viewSetup.actions.onRemoveFromDeck(null, store)
			store.state.onClose?.(store.state.value)
		},

	},

	mutators: {
		setValue: (value: string) => ({ value }),
	},
}

export type JsonConfigState = typeof setup.state & ViewState
export type JsonConfigGetters = typeof setup.getters
export type JsonConfigActions = typeof setup.actions
export type JsonConfigMutators = typeof setup.mutators
export interface JsonConfigStore extends ViewStore, JsonConfigGetters, JsonConfigActions, JsonConfigMutators {
	state: JsonConfigState
}
const jsonConfigSetup = mixStores(viewSetup, setup)
export default jsonConfigSetup


