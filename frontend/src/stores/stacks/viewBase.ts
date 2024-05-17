import { socketPool } from "@/plugins/SocketService/pool"
import layoutSo from "@/stores/layout"
import { ANIM_TIME, DOC_ANIM, DOC_TYPE } from "@/types"
import { delay } from "@/utils/time"
import { LISTENER_CHANGE, StoreCore } from "@priolo/jon"
import { CardsStore } from "../docs/cards"
import { buildStore } from "../docs/utils/factory"
import { COLOR_VAR } from "../layout"
import { MESSAGE_TYPE } from "../log/utils"
import { LoadBaseStore } from "./loadBase"
import { VIEW_SIZE } from "./utils"
import { forEachViews } from "../docs/utils/manage"
import docsSo from "../docs"
import { DragDoc } from "../mouse/utils"



const viewSetup = {

	state: {
		/** identificativo della VIEW */
		uuid: <string>null,
		/** tipo di VIEW */
		type: DOC_TYPE.EMPTY,

		/** indica se la VIEW è draggabile o no */
		draggable: true,
		/** indica se la VIEW si puo' rimuovere dal DOCK */
		unclosable: false,
		/** indica se è possibile pinnare questa CARD  */
		pinnable: true,
		/** si puo' draggare dentro qualcosa */
		droppable: false,
		/** indica lo STATO di visualizzaizone */
		size: VIEW_SIZE.NORMAL,
		sizeForce: false,
		/** indica che la card è temporaneamente disabilitata */
		disabled: false,

		/** il width "normale" */
		width: 300,
		widthMin: 40,
		widthMax: 600,
		/** colore caratteristico della  VIEW */
		colorVar: COLOR_VAR.DEFAULT,
		/** il corrente stato di animazione */
		docAnim: DOC_ANIM.EXIT,
		/** disabilita qualsiasi animazione */
		docAniDisabled: false,

		/** la sua VIEW PARENT */
		parent: <ViewStore>null,
		/** la sua VIEW LINKED */
		linked: <ViewStore>null,
		/** il GROUP dove è visualizzata questa CARD */
		group: <CardsStore>null,

		snackbar: <SnackbarState>{
			open: false,
		},
		alert: <AlertState>{
			open: false,
		},
	},

	getters: {
		getStyAni: (_: void, store?: ViewStore) => {
			let style: React.CSSProperties = {
				width: store.getWidth()
			}
			switch (store.state.docAnim) {
				case DOC_ANIM.EXIT:
				case DOC_ANIM.EXITING:
					style = {
						...style,
						width: 0,
						transform: `translate(${-style.width}px, 0px)`,
					}
					break
				case DOC_ANIM.SHOWING:
					break
				case DOC_ANIM.DRAGGING:
					const color = layoutSo.state.theme.palette.var[store.state.colorVar]
					style = {
						...style,
						border: `2px dashed ${color.bg}`,
					}
					break
				default:
					break
			}
			return style
		},

		//#region OVERRIDABLE
		/** restituisce il width effettivo */
		getWidth: (_: void, store?: ViewStore) => {
			if (docsSo.state.zenCard == store) return store.state.widthMax
			if (store.state.size == VIEW_SIZE.COMPACT) return store.state.widthMin
			return store.state.width
		},
		getTitle: (_: void, store?: ViewStore): string => null,
		getSubTitle: (_: void, store?: ViewStore): string => null,
		getSerialization: (_: void, store?: ViewStore) => {
			return {
				uuid: store.state.uuid,
				type: store.state.type,
				//position: store.state.position,
				size: store.state.size,
				linked: store.state.linked?.getSerialization(),
			}
		},
		//#endregion
	},

	actions: {
		//#region OVERRIDABLE
		/** quando questa CARD è linked ad un parent */
		onLinked: (_: void, store?: ViewStore) => { },
		/** quando è stato eseguita la build di questo store */
		onCreated: (_: void, store?: ViewStore) => { },

		onRemoveFromDeck: (_: void, store?: ViewStore) => {
			store.state.group.remove({ view: store, anim: true });
			(store as LoadBaseStore).fetchAbort?.()
		},
		/** quando viene droppato un elemento su questa card */
		onDrop: (data: DragDoc, store?: ViewStore) => { },
		/** creazione della card dalla serializzazione */
		setSerialization: (state: any, store?: ViewStore) => {
			store.state.uuid = state.uuid
			store.state.size = state.size
			// recursion
			const linkedState = state.linked
			if (!!state.linked) delete state.linked
			if (linkedState) {
				const linkedStore = buildStore({ type: linkedState.type, group: store.state.group })
				linkedStore.setSerialization(linkedState)
				store.setLinked(linkedStore)
				linkedStore.onLinked()
			}
		},
		//#endregion

		// LINKED una CARD a questa. Se c'era gia' una CARD la elimina.
		setLinked: (view: ViewStore, store?: ViewStore) => {
			// lo setto a NULL
			if (!view) {
				// c'era un precedente
				if (!!store.state.linked) {
					store.state.linked.state.parent = null
					//[II] da cambiare con 
					forEachViews([store.state.linked], (v) => { v.state.group = null })
					//store.state.linked.state.group = null
				}
				store.state.linked = null
				// setto effettivamente un LINKED
			} else {
				view.state.parent = store
				// [II] view.state.group = store.state.group
				forEachViews([view], (v) => { v.state.group = store.state.group })
				store.state.linked = view
			}
			return store
		},
		docAnim: async (docAnim: DOC_ANIM, store?: ViewStore) => {
			let animTime = 0
			let noSet = false
			const currAnim = store.state.docAnim
			let nextAnim = null

			if (docAnim == DOC_ANIM.SHOWING && currAnim == DOC_ANIM.SHOW) {
				return
			} else if (docAnim == DOC_ANIM.EXITING && currAnim == DOC_ANIM.EXIT) {
				return
			} else if (docAnim == DOC_ANIM.SHOWING && currAnim == DOC_ANIM.EXITING) {
				animTime = ANIM_TIME
				noSet = true
			} else if (docAnim == DOC_ANIM.EXITING && currAnim == DOC_ANIM.SHOWING) {
				animTime = ANIM_TIME
				noSet = true
			} else if (docAnim == DOC_ANIM.EXITING) {
				animTime = ANIM_TIME
				nextAnim = DOC_ANIM.EXIT
			} else if (docAnim == DOC_ANIM.SHOWING) {
				animTime = ANIM_TIME
				nextAnim = DOC_ANIM.SHOW
			} else if (docAnim == DOC_ANIM.SIZING) {
				animTime = ANIM_TIME
				nextAnim = DOC_ANIM.SHOW
			}

			if (animTime > 0) {
				if (nextAnim == null) nextAnim = docAnim
				if (!noSet) store.setDocAnim(docAnim)
				await delay(ANIM_TIME)
				store.setDocAnim(nextAnim)
			} else {
				store.setDocAnim(docAnim)
			}
		},

		async alertOpen(alert: AlertState, store?: ViewStore): Promise<boolean> {
			return new Promise<boolean>((res, rej) => {
				alert.resolve = res
				store.setAlert({
					...{ labelCancel: "CANCEL", labelOk: "OK", title: "ALERT", open: true },
					...alert
				})
			})
		},

	},

	mutators: {
		setSize: (size: VIEW_SIZE, store?: ViewStore) => {
			store.docAnim(DOC_ANIM.SIZING)
			return { size }
		},
		setWidth: (width: number) => ({ width }),
		setDisabled: (disabled: boolean) => ({ disabled }),
		setDocAnim: (docAnim: DOC_ANIM) => ({ docAnim }),

		setSnackbar: (snackbar: SnackbarState) => ({ snackbar }),
		setAlert: (alert: AlertState) => ({ alert }),
	},

	// [II] da sistemare trovare un modo per avere puntualmente la connection SE la CARD è collegata con una connection
	onListenerChange: (store: ViewStore, type: LISTENER_CHANGE) => {
		if (store._listeners.size == 1 && type == LISTENER_CHANGE.ADD) {
			const cnnId = store.state.type == DOC_TYPE.CONNECTION ? store.state["connection"]?.id : store.state["connectionId"]
			if (cnnId) socketPool.create(`global::${cnnId}`, cnnId)
		} else if (store._listeners.size == 0) {
			const cnnId = store.state.type == DOC_TYPE.CONNECTION ? store.state["connection"]?.id : store.state["connectionId"]
			if (cnnId) socketPool.destroy(`global::${cnnId}`)
			store["fetchAbort"]?.()
		}
	}
}

export type ViewState = Partial<typeof viewSetup.state>
export type ViewGetters = typeof viewSetup.getters
export type ViewActions = typeof viewSetup.actions
export type ViewMutators = typeof viewSetup.mutators

/**
 * E' lo STORE "abstract" ereditato da tutti gli altri STORE che vogliono essere visualizzati come VIEW
 */
export interface ViewStore extends StoreCore<ViewState>, ViewGetters, ViewActions, ViewMutators {
	state: ViewState
}

export default viewSetup

export interface SnackbarState {
	open: boolean
	title?: string
	body?: string
	type?: MESSAGE_TYPE
	timeout?: number
}
export interface AlertState {
	open?: boolean
	title: string
	body: string
	labelOk?: string
	labelCancel?: string
	resolve?: (value: boolean) => void
}



