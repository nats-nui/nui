import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Connection, DOC_TYPE, EDIT_STATE } from "@/types"
import { mixStores } from "@priolo/jon"
import { buildBuckets } from "../buckets/utils/factory"
import { buildStreams } from "../streams/utils/factory"
import { VIEW_SIZE } from "../utils"
import { buildConnectionMessageSend, buildConnectionMessages, buildConnectionMetrics, buildConnectionSync } from "./utils/factory"
import { focusSo, MESSAGE_TYPE } from "@priolo/jack"
import { cloneDeep } from "@/utils/object"



const setup = {

	state: {
		/** dialog SUBSCRIPTION aperta/chiusa */
		subOpen: false,
		/** connection cache per l'edit */
		connection: <Connection>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 215,
		//colorVar: COLOR_VAR.GREEN,
		size: VIEW_SIZE.COMPACT,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CONNECTION",
		getSubTitle: (_: void, store?: ViewStore) => (store as CnnDetailStore).getConnection()?.name ?? "--",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as CnnDetailState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connection: { id: state.connection?.id },
			}
		},
		//#endregion

		getConnection: (_: void, store?: CnnDetailStore) => {
			if (store.state.editState == EDIT_STATE.READ) {
				return cnnSo.getById(store.state.connection.id)
			}
			return store.state.connection
		},

		getMessagesOpen: (_: void, store?: CnnDetailStore) => store.state.linked?.state.type == DOC_TYPE.MESSAGES,
		getSyncOpen: (_: void, store?: CnnDetailStore) => store.state.linked?.state.type == DOC_TYPE.SYNC,
		getStreamsOpen: (_: void, store?: CnnDetailStore) => store.state.linked?.state.type == DOC_TYPE.STREAMS,
		getBucketsOpen: (_: void, store?: CnnDetailStore) => store.state.linked?.state.type == DOC_TYPE.BUCKETS,
		getMetricsOpen: (_: void, store?: CnnDetailStore) => store.state.linked?.state.type == DOC_TYPE.CNN_METRICS,

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as CnnDetailState
			state.connection = data.connection
		},
		onLinked: (_: void, store?: ViewStore) => {
			const cnnStore = store as CnnDetailStore
			const options = docSo.state.cardOptions[store.state.type]
			store.state.docAniDisabled = true
			if (options == DOC_TYPE.MESSAGES) {
				cnnStore.openMessages()
			} else if (options == DOC_TYPE.STREAMS) {
				cnnStore.openStreams()
			} else if (options == DOC_TYPE.BUCKETS) {
				cnnStore.openBuckets()
			}
			store.state.docAniDisabled = false
		},
		//#endregion

		/** ripristino la CONNECTION visualizzata da quella contenuta nelle CONNECTIONS */
		restore(_: void, store?: CnnDetailStore) {
			const cnn = cnnSo.getById(store.state.connection.id)
			store.setConnection(cloneDeep(cnn))
		},

		/** apertura della CARD MESSAGES */
		openMessages(_: void, store?: CnnDetailStore) {
			const detached = focusSo.state.shiftKey
			const isOpen = store.getMessagesOpen()
			const view = !isOpen || detached ? buildConnectionMessages(store.state.connection?.id) : null
			store.state.group[detached ? "add" : "addLink"]({ view, parent: store, anim: true })
		},
		openSync(_: void, store?: CnnDetailStore) {
			const detached = focusSo.state.shiftKey
			const isOpen = store.getSyncOpen()
			const view = !isOpen || detached ? buildConnectionSync(store.state.connection?.id) : null
			store.state.group[detached ? "add" : "addLink"]({ view, parent: store, anim: true })
		},
		/** apertura della CARD STREAMS */
		openStreams(_: void, store?: CnnDetailStore) {
			const detached = focusSo.state.shiftKey
			const isOpen = store.getStreamsOpen()
			const view = !isOpen || detached ? buildStreams(store.state.connection?.id) : null
			store.state.group[detached ? "add" : "addLink"]({ view, parent: store, anim: true })
		},
		/** apertura della CARD BUCKETS */
		openBuckets(_: void, store?: CnnDetailStore) {
			const detached = focusSo.state.shiftKey
			const isOpen = store.getBucketsOpen()
			const view = !isOpen || detached ? buildBuckets(store.state.connection?.id) : null
			store.state.group[detached ? "add" : "addLink"]({ view, parent: store, anim: true })
		},
		/** apertura CARD MESSAGE-SEND */
		openMessageSend(_: void, store?: CnnDetailStore) {
			const detached = focusSo.state.shiftKey
			const cnn = store.getConnection()
			if (!cnn) return
			const subscriptions = store.state.connection?.subscriptions?.map(s => s.subject)
			store.state.group[detached ? "add" : "addLink"]({
				view: buildConnectionMessageSend(
					cnn.id,
					subscriptions,
				),
				parent: store,
				anim: true,
			})
		},
		/** apertura della CARD METRICS */
		openMetrics(_: void, store?: CnnDetailStore) {
			const metrics = store.state.connection?.metrics
			if (!metrics?.httpSource?.active && !metrics?.natsSource?.active) {
				store.setSnackbar({
					open: true, type: MESSAGE_TYPE.WARNING, timeout: 5000,
					title: "WAIT WAIT....",
					body: "You need to configure the METRICS section first!",
				})
				return
			}
			const detached = focusSo.state.shiftKey
			const isOpen = store.getMetricsOpen()
			const view = !isOpen || detached ? buildConnectionMetrics(store.state.connection?.id) : null
			store.state.group[detached ? "add" : "addLink"]({ view, parent: store, anim: true })
		},

	},

	mutators: {
		setConnection: (connection: Connection) => ({ connection }),
		setSubOpen: (subOpen: boolean) => ({ subOpen }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type CnnDetailState = typeof setup.state & ViewState
export type CnnDetailGetters = typeof setup.getters
export type CnnDetailActions = typeof setup.actions
export type CnnDetailMutators = typeof setup.mutators & ViewMutators
export interface CnnDetailStore extends ViewStore, CnnDetailGetters, CnnDetailActions, CnnDetailMutators {
	state: CnnDetailState
}
const connectonSetup = mixStores(viewSetup, setup) as typeof setup
export default connectonSetup
