import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import editorSetup, { EditorState } from "../editorBase"
import { withReact } from "slate-react"
import { Editor, Element, Node, Path, Range, Text,  Transforms,  createEditor } from "slate"
import { BLOCK_TYPE, ElementType, NodeType, TextType } from "./utils/types"
import { withHistory } from 'slate-history'


const setup = {

	state: () => {

		const editor = withHistory(withReact(createEditor()))
		//sovrascivo "insertData". Devo memorizzare la vecchia funzione per poterla richiamare sulla nuova
		// const { insertData } = editor
		// editor.insertData = async (data) => {
		// 	const fnOrigin = await insertData(data)
		// 	if (!fnOrigin) return null
		// 	await fnOrigin(data)
		// }

		Transforms.insertNodes(editor, initialValue)

		return {
			editor,
			content: <string>null,
			formatOpen: false,

			//#region VIEWBASE
			colorVar: COLOR_VAR.CYAN,
			width: 420,
			widthMax: 1000,
			//#endregion
		}
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "EDITOR",
		getSubTitle: (_: void, store?: ViewStore) => "Editor",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as TextEditorState
			return {
				...viewSetup.getters.getSerialization(null, store),
				content: state.content,
			}
		},
		//#endregion

		/**
		 * Restituisce il primo NODE-ENTRY attualmente SELECTED
		 */
		getFirstSelectEntry: (_: void, store?: TextEditorStore) => {
			const entry = Editor.node(
				store.state.editor,
				store.state.editor.selection,
				{ depth: 1 }
			) as [NodeType, Path]
			return entry
		},

		/**
		 * Inserisco un NODE nel PATH indicato e lo seleziono
		 */
		addNode: ({ path, node, options }, store?: TextEditorStore) => {
			// prendo il prossimo PATH [number]
			const pathNext = Path.next(path)
			// inserisco un NODE nel prossimo PATH
			Transforms.insertNodes(store.state.editor, node, { at: pathNext })
			// lo seleziono
			if (options?.select) Transforms.select(store.state.editor, pathNext)
		},

		/**
		 * il LEAF attualmente SELECTED 
		 */
		getEntryTextSelect: (_: void, store?: TextEditorStore) => {
			if (!store.state.editor.selection) return null
			const entry = Editor.leaf(
				store.state.editor,
				Range.start(store.state.editor.selection)
			) as [NodeType, Path]
			return entry
		},

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as TextEditorState
			state.content = data.content
		},
		//#endregion

		changeSelectText: (nodePartial: Partial<TextType>, store?: TextEditorStore) => {
			Transforms.setNodes(
				store.state.editor,
				nodePartial,
				{ match: n => Text.isText(n), split: true }
			)
		},

		/**
		 * Elimino i BLOCKs selezionati, li unisco in un unico TYPE e li reinserisco
		 */
		changeSelectTypeAndMerge: (type, store?: TextEditorStore) => {
			const { editor } = store.state
			const selectA = editor.selection.anchor.path[0]
			const selectB = editor.selection.focus.path[0]

			// se è solo un BLOCK allora lo aggiorna solamente
			if (selectA == selectB) {
				const elementUpdate = { type }
				Transforms.setNodes(
					editor,
					elementUpdate,
					{ match: n => !Editor.isEditor(n) && Element.isElement(n), },
				)
				return
			}

			const span = [[Math.min(selectA, selectB)], [Math.max(selectA, selectB)]]
			// prendo tutti i TEXT presenti nello SPAN
			const textsGen = Node.texts(editor, {
				from: span[0], to: span[1],
			})
			// se true prende del NODE solo la proprietà "text" altrimenti tutto
			const onlyText = type == BLOCK_TYPE.CODE //|| type == BLOCK_TYPE.IMAGE
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
			Transforms.removeNodes(editor, { at: span })
			// inserisco al loro posto il nuovo NODE
			Transforms.insertNodes(editor, node, {
				at: span[0], select: true, hanging: true, voids: true, mode: "highest",
			})
		},

	},

	mutators: {
		setFormatOpen: (formatOpen: boolean) => ({ formatOpen }),
	},
}

export type TextEditorState = ReturnType<typeof setup.state> & ViewState & EditorState
//export type TextEditorState = typeof setup.state & ViewState & EditorState
export type TextEditorGetters = typeof setup.getters
export type TextEditorActions = typeof setup.actions
export type TextEditorMutators = typeof setup.mutators
export interface TextEditorStore extends ViewStore, StoreCore<TextEditorState>, TextEditorGetters, TextEditorActions, TextEditorMutators {
	state: TextEditorState
}
const txtEditorSetup = mixStores(viewSetup, setup)
export default txtEditorSetup


const initialValue = [
	{
		type: 'paragraph',
		children: [{ text: 'A line 1 of text in a paragraph.' }],
	},
	{
		type: 'paragraph',
		children: [{ text: 'A line 2 of text in a paragraph.' }],
	},
	{
		type: 'paragraph',
		children: [{ text: 'A line 3 of text in a paragraph.' }],
	},
	{
		type: 'paragraph',
		children: [{ text: 'A line 4 of text in a paragraph.' }],
	},
]