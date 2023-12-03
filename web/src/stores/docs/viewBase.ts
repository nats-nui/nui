import { ANIM_TIME, DOC_ANIM, DOC_TYPE, POSITION_TYPE } from "@/types"
import { StoreCore } from "@priolo/jon"
import React from "react"
import { PARAMS_MESSAGES } from "../stacks/messages/utils"



export enum PARAMS_DOC {
	POSITION = "pos",
}
export enum DOC_VARIANTS {
	DEFAULT = "",
	LINK = "_link",
}

const setup = {

	state: {
		uuid: <string>null,
		type: DOC_TYPE.EMPTY,
		params: <{ [name: string]: any[] }>{},

		draggable: true,
		docAnim: DOC_ANIM.EXIT,
		width: 300,
		styInit: {
			transition: `transform 300ms, width ${ANIM_TIME}ms`,
			transitionTimingFunction: "cubic-bezier(0.000, 0.350, 0.225, 1.175)",
		},

		position: POSITION_TYPE.DETACHED,
		parent: <ViewStore>null,
		linked: <ViewStore>null,
	},

	getters: {
		getParam(name: string, store?: ViewStore) {
			return store.state.params?.[name]?.[0]
		},
		getStyAni: (_: void, store?: ViewStore):React.CSSProperties => {
			switch (store.state.docAnim) {
				case DOC_ANIM.EXIT:
				case DOC_ANIM.EXITING:
					return { width: 0, transform: `translate(${-store.state.width}px, 0px)` }
				case DOC_ANIM.SHOWING:
					return null //return { width: 0 }
				default:
					return null
			}
		},
	},

	actions: {
	},

	mutators: {
		setParams(ps: { [name: string]: any }, store?: ViewStore) {
			const params = { ...store.state.params, ...ps }
			return { params }
		},
		setWidth: (width: number, store?: ViewStore) => ({ width }),
		setDocAnim: (docAnim: DOC_ANIM, store?: ViewStore) => {

			let delay = 0
			let noSet = false
			const currAnim = store.state.docAnim
			let nextAnim = null

			if (docAnim == DOC_ANIM.SHOWING && currAnim == DOC_ANIM.SHOW) {
				return
			} else if (docAnim == DOC_ANIM.EXITING && currAnim == DOC_ANIM.EXIT) {
				return
			} else if (docAnim == DOC_ANIM.SHOWING && currAnim == DOC_ANIM.EXITING) {
				delay = ANIM_TIME + 100
				noSet = true
			} else if (docAnim == DOC_ANIM.EXITING && currAnim == DOC_ANIM.SHOWING) {
				delay = ANIM_TIME
				noSet = true
			} else if (docAnim == DOC_ANIM.EXITING) {
				delay = ANIM_TIME
				nextAnim = DOC_ANIM.EXIT
			} else if (docAnim == DOC_ANIM.SHOWING) {
				delay = ANIM_TIME
				nextAnim = DOC_ANIM.SHOW
			}

			if (delay > 0) {
				if (nextAnim == null) nextAnim = docAnim
				setTimeout(() => {
					store.setDocAnim(nextAnim)
				}, delay)
				if (noSet) return
			}

if ( store.getParam(PARAMS_MESSAGES.CONNECTION_ID) == "cnn112345601") console.log("mutator", docAnim)
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

