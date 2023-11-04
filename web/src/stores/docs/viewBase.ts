import { DOC_ANIM, DOC_TYPE, POSITION_TYPE } from "@/types"
import { StoreCore } from "@priolo/jon"



export enum PARAMS_DOC {
	POSITION = "pos",
}

const setup = {

	state: {
		uuid: <string>null,
		type: DOC_TYPE.EMPTY,
		params: <{ [name: string]: any[] }>{},

		draggable: true,
		docAnim: DOC_ANIM.INIT,

		position: POSITION_TYPE.DETACHED,
		parent: <ViewStore>null,
		linked: <ViewStore>null,

		dialogOpen: false,
	},

	getters: {
		getParam(name: string, store?: ViewStore) {
			return store.state.params?.[name]?.[0]
		},
	},

	actions: {
	},

	mutators: {
		setParams(ps: { [name: string]: any }, store?: ViewStore) {
			const params = { ...store.state.params, ...ps }
			return { params }
		},
		setDialogOpen: (dialogOpen: boolean) => ({ dialogOpen }),
		setDocAnim: (docAnim: DOC_ANIM, store?: ViewStore) => {


			let delay = 0
			let noSet = false
			let nextAnim = null

			if (docAnim == DOC_ANIM.SHOWING && store.state.docAnim == DOC_ANIM.SHOW) {
				return
			} else if (docAnim == DOC_ANIM.EXITING && store.state.docAnim == DOC_ANIM.EXIT) {
				return
			} else if (docAnim == DOC_ANIM.SHOWING && store.state.docAnim == DOC_ANIM.EXITING) {
				delay = 500
				noSet = true
			} else if (docAnim == DOC_ANIM.EXITING && store.state.docAnim == DOC_ANIM.SHOWING) {
				delay = 500
				noSet = true
			} else if (docAnim == DOC_ANIM.EXITING) {
				delay = 400
				nextAnim = DOC_ANIM.EXIT
			} else if (docAnim == DOC_ANIM.SHOWING) {
				delay = 400
				nextAnim = DOC_ANIM.SHOW
			}

			if (delay > 0) {
				if (nextAnim == null) nextAnim = docAnim
				setTimeout(() => {
					store.setDocAnim(nextAnim)
				}, delay)
				if (noSet) return
			}

//console.log("setDocAnim", docAnim)
			return { docAnim }
		},
	},
}

export type ViewState = Partial<typeof setup.state>
export type ViewGetters = typeof setup.getters
export type ViewActions = typeof setup.actions
export type ViewMutators = typeof setup.mutators

/**
 * E' lo STORE "abstract" ereditato da tutti gli altri STORE che vogliono essere visualizzati come VIEW
 */
export interface ViewStore extends StoreCore<ViewState>, ViewGetters, ViewActions, ViewMutators {
	state: ViewState
}

export default setup

