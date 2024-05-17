import { StoreCore, createStore } from "@priolo/jon"
import { DOC_ANIM, DOC_TYPE } from "../docs/types"
import { DragDoc, Position } from "./utils"
import { TextEditorStore } from "../stacks/editor"
import { NODE_TYPES } from "../stacks/editor/utils/types"
import { Editor, Transforms } from "slate"



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
				// se la destinazione è un EDITOR...
				if (destination.view.state.type == DOC_TYPE.TEXT_EDITOR && destination.index != null) {
					const editor = (destination.view as TextEditorStore).state.editor
					// se è uno spostamente all'interno della stessa CARD
					if (source.view == destination.view) {
						//editor.deselect()

						//const node = editor.node([source.index])
						//editor.removeNodes({ at:[source.index]})
						//editor.insertNode(node[0], { at: [0]})

						editor.moveNodes({
							at: [source.index],
							to: [destination.index],
						})
					} else {
						const node = {
							type: NODE_TYPES.CARD,
							data: source.view.getSerialization(),
							subtitle: source.view.getSubTitle(),
							colorVar: source.view.state.colorVar,
							children: [{ text: source.view.getTitle() }],
						}
						editor.insertNode(node, {
							at: [destination.index + 1]
						})
					}
				}

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


