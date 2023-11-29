import docsSo from "@/stores/docs"
import cnnSo from "@/stores/connections"
import docSetup, { ViewState, ViewStore } from "@/stores/docs/viewBase"
import { Connection, DOC_ANIM, DOC_TYPE } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildStore } from "../../docs/utils/factory"
import { CnnListStore } from "./list"
import { MessagesState, PARAMS_MESSAGES } from "../messages"



const setup = {

	state: {
		/** dialog SUBSCRIPTION aperta/chiusa */
		subOpen: false,
		/** connection attualmente in editazione */
		connection: <Connection>null,
		/** OVERWRITING */
		draggable: false,
		width: 146,
	},

	getters: {
		getConnection(_: void, store?: CnnDetailStore) {
			const cnnId = (<CnnListStore>store.state.parent).getSelectId()
			const cnn = cnnSo.getById(cnnId)
			return cnn
		}
	},

	actions: {
		/** apertura STACK MESSAGES */
		openMessages(_: void, store?: CnnDetailStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			const msgStore = buildStore({
				type: DOC_TYPE.MESSAGES,
				params: { [PARAMS_MESSAGES.CONNECTION_ID]: [cnn.id] },
				subscriptions: [...cnn.subscriptions]
			} as MessagesState)
			docsSo.addLink({
				view: msgStore,
				parent: store,
			})
		},
		updateConnection(_: void, store?: CnnDetailStore) {

		}
	},

	mutators: {
		setConnection: (connection: Connection) => ({ connection }),
		setSubOpen: (subOpen: boolean) => ({ subOpen }),
		setDocAnim: (docAnim: DOC_ANIM, store?: ViewStore) => {
			//console.log(docAnim)
			if (docAnim == DOC_ANIM.EXITING || docAnim == DOC_ANIM.EXIT) {
				//store.setStyAni({ width: 0, })
				store.setStyAni({ 
					width: 0,
					transform: `translate(${-store.state.width}px, 0px)`,
				})
			} else {
				store.setStyAni(null)
			}
			return docSetup.mutators.setDocAnim(docAnim, store)
		}
	},
}

export type CnnDetailState = typeof setup.state & ViewState
export type CnnDetailGetters = typeof setup.getters
export type CnnDetailActions = typeof setup.actions
export type CnnDetailMutators = typeof setup.mutators
export interface CnnDetailStore extends ViewStore, StoreCore<CnnDetailState>, CnnDetailGetters, CnnDetailActions, CnnDetailMutators {
	state: CnnDetailState
}
const srvSetup = mixStores(docSetup, setup)
export default srvSetup
