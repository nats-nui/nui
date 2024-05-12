import { StoreCore, createStore } from "@priolo/jon"
import { DOC_ANIM, DOC_TYPE } from "../docs/types"
import { DragDoc, Position } from "./utils"
import { TextEditorStore } from "../stacks/editor"
import { NODE_TYPES } from "../stacks/editor/utils/types"



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
			drag.srcView.docAnim(DOC_ANIM.DRAGGING)
		},

		stopDrag(_: void, store?: MouseStore) {
			const { srcView, dstView, index, groupDest } = store.state.drag
			srcView.docAnim(DOC_ANIM.SHOW)

			// spostamentro dentro un altra VIEW
			if (dstView) {
				dstView.onDrop(store.state.drag)
				if (dstView.state.type == DOC_TYPE.TEXT_EDITOR && index != null) {
					const editor = (dstView as TextEditorStore).state.editor
					const node = {
						type: NODE_TYPES.CARD,
						data: srcView.getSerialization(),
						subtitle: srcView.getSubTitle(),
						colorVar: srcView.state.colorVar,
						children: [{ text: srcView.getTitle() }],
					}
					editor.insertNode(node, {
						at: [index+1]
					})
				}
				// spostamento su DROP-AREA
			} else {
				srcView.state.group.move({ view: srcView, index, groupDest, anim: true })
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


