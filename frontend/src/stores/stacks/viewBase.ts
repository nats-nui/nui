import docSo from "@/stores/docs"
import layoutSo from "@/stores/layout"
import { ANIM_TIME, DOC_ANIM, DOC_TYPE } from "@/types"
import { delay } from "@/utils/time"
import { StoreCore } from "@priolo/jon"
import { buildStore } from "../docs/utils/factory"
import { COLOR_VAR } from "../layout"
import { VIEW_SIZE } from "./utils"
import { MESSAGE_TYPE } from "../log/utils"



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
		/** indica lo STATO di visualizzaizone */
		size: VIEW_SIZE.NORMAL,

		/** il width "normale" */
		width: 300,
		/** colore caratteristico della  VIEW */
		colorVar: COLOR_VAR.DEFAULT,
		/** il corrente stato di animazione */
		docAnim: DOC_ANIM.EXIT,

		/** la sua VIEW PARENT */
		parent: <ViewStore>null,
		/** la sua VIEW LINKED */
		linked: <ViewStore>null,

		snackbar: <SnackbarState>{
			open:false,
		},
		loadingMessage: <React.ReactNode>null,
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
		getWidth: (_: void, store?: ViewStore) => store.state.size == VIEW_SIZE.COMPACT ? 40 : store.state.size == VIEW_SIZE.NORMAL ? store.state.width : 600,
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
		onCreate: (_: void, store?: ViewStore) => { },
		onDestroy: (_: void, store?: ViewStore) => {
			docSo.remove({ view: store, anim: true })
		},
		setSerialization: (state: any, store?: ViewStore) => {
			store.state.uuid = state.uuid
			//store.state.position = state.position
			store.state.size = state.size
			const linkedState = state.linked
			delete state.linked
			if ( linkedState ) {
				const linkedStore = buildStore({ type: linkedState.type })
				linkedStore.setSerialization(linkedState)
				store.setLinked(linkedStore)
			}
		},
		//#endregion

		setLinked: (view: ViewStore, store?: ViewStore) => {
			if (!view) {
				if (!!store.state.linked) {
					store.state.linked.state.parent = null
				}
				store.state.linked = null
			} else {
				view.state.parent = store
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
	},

	mutators: {
		setSize: (size: VIEW_SIZE) => ({ size }),
		setDocAnim: (docAnim: DOC_ANIM) => ({ docAnim }),
		setSnackbar: (snackbar: SnackbarState) => ({ snackbar }),
		setLoadingMessage: (loadingMessage: string) => ({ loadingMessage }),
	},
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
}

