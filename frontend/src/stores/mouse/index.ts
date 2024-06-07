import { StoreCore, createStore } from "@priolo/jon"
import { DOC_ANIM } from "../docs/types"
import { DragDoc, Position } from "./utils"



/** gestisce il DRAG&DROP */
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
			function fnMouseUp(e: MouseEvent) {
				document.removeEventListener('mousemove', fnMouseMove)
				document.removeEventListener('mouseup', fnMouseUp)
				console.log(e.target)
				store.stopDrag()
			}
			document.addEventListener('mousemove', fnMouseMove);
			document.addEventListener('mouseup', fnMouseUp);
			store.setDrag(drag)
			// se si tratta di uno spostamento di CARD:
			if (!!drag.source.view && !drag.source.index) drag.source.view.docAnim(DOC_ANIM.DRAGGING)
		},

		stopDrag(_: void, store?: MouseStore) {
			const { source, destination } = store.state.drag
			if (!source) return null
			source.view?.docAnim(DOC_ANIM.SHOW)

			// spostamentro dentro un altra VIEW e destinazione e sorgente sono diversi
			if (!!destination?.view
				&& (source.view != destination.view || source.index != destination.index)
			) {
				destination.view.onDrop(store.state.drag)

				// spostamento su DROP-AREA
			} else if (destination?.index != null && !!destination?.group) {
				source.view.state.group.move({
					view: source.view,
					index: destination.index,
					groupDest: destination.group,
					anim: true
				})
			}

			store.setDrag(null)
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
const mouseSo = createStore(setup) as MouseStore
export default mouseSo


