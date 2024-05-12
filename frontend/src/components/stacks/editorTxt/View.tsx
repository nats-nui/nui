import FrameworkCard from "@/components/cards/FrameworkCard"
import { TextEditorStore } from "@/stores/stacks/editor"
import { NODE_TYPES, NodeType } from "@/stores/stacks/editor/utils/types"
import { FunctionComponent } from "react"
import { Editor, Node, Transforms } from "slate"
import { Editable, Slate } from "slate-react"
import FormatDialog from "./FormatDialog"
import cls from "./View.module.css"
import BiblioElement from "./elements/BiblioElement"
import BiblioLeaf from "./leafs/BiblioLeaf"



interface Props {
	store?: TextEditorStore
}

const EditorView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE


	// HOOKs

	// HANDLER
	const handleFocus = () => {
		store.setFormatOpen(true)
	}
	const handleBlur = () => {
		//store.setFormatOpen(false)
	}
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		// premo il bottone ENTER
		if (event.key == "Enter") {
			const node = editor.node(editor.selection, { depth: 1 })?.[0] as NodeType
			if (event.ctrlKey || event.altKey || event.shiftKey) {
				if (node.type == NODE_TYPES.CODE) {
					event.preventDefault();
					editor.insertBreak()
					return
				} else if (node.type == NODE_TYPES.TEXT) {
					event.preventDefault();
					editor.insertText("\n")
					return
				}
			} else {
				if (node.type == NODE_TYPES.CODE) {
					event.preventDefault();
					editor.insertText("\n")
					return
				}
			}
		}



		// 	// prelevo l'ENTRY in corrente selezione, aggiungo un TEXT dopo e lo seleziono
		// 	const [node, path] = store.getFirstSelectEntry()
		// 	if (node.type == NODE_TYPES.CODE || node.type == NODE_TYPES.IMAGE) {
		// 		event.preventDefault()
		// 		store.addNode({
		// 			path,
		// 			node: { type: "text", children: [{ text: "" }] },
		// 			options: { select: true }
		// 		})
		// 		return
		// 	}

		// se non sto premento contemporaneamente CTRL annulla
		if (!event.ctrlKey) return
		// altrimenti...
		switch (event.key) {
			case 'b': {
				event.preventDefault()
				const marks = Editor.marks(editor)
				const isBold = marks ? marks["bold"] === true : false
				Editor.addMark(editor, 'bold', !isBold)
				break
			}
			case 'i': {
				event.preventDefault()
				const marks = Editor.marks(editor)
				const isItalic = marks ? marks["italic"] === true : false
				Editor.addMark(editor, 'italic', !isItalic)
				break
			}
		}
	}

	// RENDER
	const editor = store.state.editor
	console.log("SLATE render")
	return <FrameworkCard
		store={store}
	>
		<Slate
			editor={editor}
			initialValue={editor.children}
		>
			<Editable className={cls.editor}
				spellCheck={false}
				renderElement={props => <BiblioElement {...props} />}
				renderLeaf={props => <BiblioLeaf {...props} />}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>

			<FormatDialog store={store} />
		</Slate>

	</FrameworkCard>
}

export default EditorView

