import docSo from "@/stores/docs"
import { StoreCore, createStore } from "@priolo/jon"
import { DOC_ANIM } from "../docs/types"
import { DragDoc, Position } from "./utils"


const setup = {

	state: {
		drag: <DragDoc>null,
		position: <Position>null,
	},

	getters: {
	},

	actions: {
		startDrag(drag: DragDoc, store?: MouseStore) {
			function fnMouseMove(e: any) {
				store.setPosition({ x: e.pageX, y: e.pageY })
			}
			function fnMouseUp() {
				document.removeEventListener('mousemove', fnMouseMove)
				document.removeEventListener('mouseup', fnMouseUp)
				store.stopDrag()
			}
			document.addEventListener('mousemove', fnMouseMove);
			document.addEventListener('mouseup', fnMouseUp);
			store.setDrag(drag)
			drag.srcView.docAnim(DOC_ANIM.DRAGGING)
		},
		stopDrag(_: void, store?: MouseStore) {
			const { srcView, index } = store.state.drag
			srcView.docAnim(DOC_ANIM.SHOW)
			store.setDrag(null)

			if (index == -1) {
				docSo.anchor(srcView)
			} else {
				docSo.move({ view: srcView, index, anim: true })
			}
		}
	},

	mutators: {
		setDrag: (drag: DragDoc) => ({ drag }),
		setPosition: (position: Position) => ({ position }),
	},
}

export type MouseState = typeof setup.state
export type MouseGetters = typeof setup.getters
export type MouseActions = typeof setup.actions
export type MouseMutators = typeof setup.mutators
export interface MouseStore extends StoreCore<MouseState>, MouseGetters, MouseActions, MouseMutators {
	state: MouseState
}
const store = createStore(setup) as MouseStore
export default store


