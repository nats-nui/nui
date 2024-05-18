import { BaseOperation, Editor, Element, Node, Range, Transforms } from "slate"
import { NODE_TYPES, NodeType } from "./types"
import { ReactEditor } from "slate-react"
import { ViewStore } from "../../viewBase"

/**

 */
export const withSugar = (editor: ReactEditor) => {

	//const { onChange/*normalizeNode, isInline, isVoid*/ } = editor
	const se = editor as SugarEditor


	// se.onChange =  (
	// 	options?: {operation?: BaseOperation}
	// ) => {
	// 	onChange(options)
	// }

	/**
	 * Elimino i BLOCKs selezionati, li unisco in un unico TYPE e li reinserisco
	 */
	se.setTypeOnSelect = (type: NODE_TYPES) => {
		// Non fare nulla se non c'è una selezione o se la selezione è collassata
		if (!editor.selection) return;

		const selectA = editor.selection.anchor.path[0]
		const selectB = editor.selection.focus.path[0]
		const split = type != NODE_TYPES.TEXT
		const onlySelect = type == NODE_TYPES.TEXT
		const merge = type == NODE_TYPES.CODE

		// non devo eseguire il merge...
		if (!merge) {
			const node: Partial<NodeType> = { type }
			Transforms.setNodes(
				editor,
				node,
				{
					match: n => !Editor.isEditor(n) && Element.isElement(n),
					split,
					at: onlySelect ? undefined : [selectA]
				},
			)
			return
		}

		// prendo tutti i TEXT presenti nella selection
		const textsGen = Node.texts(editor, {
			from: [Math.min(selectA, selectB)],
			to: [Math.max(selectA, selectB)],
		})
		// se true prende del NODE solo la proprietà "text" altrimenti tutto
		const onlyText = type == NODE_TYPES.CODE //|| type == BLOCK_TYPE.IMAGE
		// mergio tutti i TEXT
		const texts = [...textsGen].map((textEntry, index, array) => {
			const textNode = textEntry[0]
			const endline = index < array.length - 1 ? "\n" : ""
			const text = `${textNode.text}${endline}`
			return { ...(onlyText ? {} : textNode), text }
		})
		// creo il nuovo node
		const node = { type, children: texts }
		// rimuovo i vecchi NODE
		Transforms.removeNodes(editor)
		// inserisco al loro posto il nuovo NODE
		Transforms.insertNodes(editor, node, {
			select: true, hanging: true, voids: true, mode: "highest",
		})
	}


	return se
}


export interface SugarEditor extends ReactEditor {
	view?: ViewStore
	setTypeOnSelect: (type: NODE_TYPES) => void
}