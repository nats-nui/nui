import { StoreCore, StoreOf, createStore } from "@priolo/jon"


const setup = {

	state: {
	},

	getters: {
	},

	actions: {
	},

	mutators: {
	},
}

interface AuthStore extends StoreOf<typeof setup> {}
const store = createStore(setup) as AuthStore
export default store
