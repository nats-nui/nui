import { COLOR_VAR } from "@/stores/layout"
import { DragDoc } from "@/stores/mouse/utils"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { createEditor } from "slate"
import { withHistory } from 'slate-history'
import { withReact } from "slate-react"
import { EditorState } from "../editorBase"
import { NODE_TYPES } from "./utils/types"
import { SugarEditor, withSugar } from "./utils/withSugar"



const setup = {

	state: () => {

		// const editor: SugarEditor = withSugar(withHistory(withReact(createEditor())))
		// editor.insertNodes(initialValue)

		return {
			editor: <SugarEditor>null,
			/** valora iniziale non viene aggiornato */
			content: <string>null,

			//select: <NodeEntry>null,
			formatOpen: false,

			//#region VIEWBASE
			colorVar: COLOR_VAR.CYAN,
			width: 420,
			widthMax: 1000,
			//droppable: true,
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
				children: state.editor.children,
			}
		},
		//#endregion
	},

	actions: {
		//#region VIEWBASE
		// onDrop: (data: DragDoc, store?: ViewStore) => {
		// 	const editorSo = store as TextEditorStore
		// 	const editor = editorSo.state.editor
		// 	if ( !data.srcView ) return 

		// 	const node = {
		// 		type: NODE_TYPES.CARD,
		// 		data: data.srcView.getSerialization(),
		// 		subtitle: data.srcView.getSubTitle(),
		// 		colorVar: data.srcView.state.colorVar,
		// 		children: [{ text: data.srcView.getTitle() }],
		// 	}
		// 	editor.insertNode(node)
		// },
		onCreated: (_: void, store?: ViewStore) => {
			const editorSo = store as TextEditorStore
			const editor: SugarEditor = withSugar(withHistory(withReact(createEditor())))
			editor.insertNodes(initialValue)
			editor.view = store
			editorSo.state.editor = editor
		},
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as TextEditorState
			state.editor.children = data.children ?? initialValue
		},
		//#endregion
	},

	mutators: {
		setFormatOpen: (formatOpen: boolean) => ({ formatOpen }),
	},
}

export type TextEditorState = ReturnType<typeof setup.state> & ViewState & EditorState
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
		type: NODE_TYPES.CHAPTER,
		children: [{ text: "Dibattito sull'essere umano e le sue interazioni col mondo" }],
	},
	{
		type: NODE_TYPES.PARAGRAPH,
		children: [{ text: "Il primo scontro: il conetto dello spurgo" }],
	},
	{
		type: NODE_TYPES.TEXT,
		children: [{ text: "Vorrei sottolineare in questa occasione che l'alalisi è stata condotta su topi e non su veri esseri umani\nMa il concetto è lo stesso dai cioe' c'hanno entrambi la bocca no?" }],
	},
	{
		type: NODE_TYPES.PARAGRAPH,
		children: [{ text: "Raccontiamoci" }],
	},
	{
		type: NODE_TYPES.TEXT,
		children: [{ text: "In questo capitolo aaaa no è un paragrafo! Ok, in questo \"paragrafo\" mi preme qualcosa da dire ma non la dirò per evitare di attivare quel discorso che ci porterebbe al punto 23." }],
	},
	{
		type: NODE_TYPES.TEXT,
		children: [{ text: "Questo è un codice di esempio:" }],
	},

	{
		type: NODE_TYPES.CODE,
		children: [{ text: "{ pippo: 45, serafino: 'update' }" }],
	},

]

