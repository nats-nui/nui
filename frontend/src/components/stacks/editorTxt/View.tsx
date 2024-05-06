import FrameworkCard from "@/components/cards/FrameworkCard"
import { TextEditorState, TextEditorStore } from "@/stores/stacks/editor"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./View.module.css"
import { Editable, ReactEditor, Slate } from "slate-react"
import { BLOCK_TYPE } from "@/stores/stacks/editor/utils/types"
import { NodeType } from "@/stores/stacks/editor/utils/types"
import { Path } from "msw"
import BiblioElement from "./elements/BiblioElement"
import BiblioLeaf from "./leafs/BiblioLeaf"
import Dialog from "@/components/dialogs/Dialog"
import { Editor, Element, Transforms } from "slate"



interface Props {
	store?: TextEditorStore
}

const EditorView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store) as TextEditorState

	// HOOKs

	// HANDLER
	const handleFormatClose = () => {
		store.setFormatOpen(false)
	}
	const handleFocus = () => {
		store.setFormatOpen(true)
	}
	const handleBlur = () => {
		//store.setFormatOpen(false)
	}
	const handleKeyDown = event => {
		// premo il bottone ENTER
		if (event.key == "Enter") {
			// prelevo l'ENTRY in corrente selezione, aggiungo un TEXT dopo e lo seleziono
			const [node, path] = store.getFirstSelectEntry()
			if (node.type == BLOCK_TYPE.CODE || node.type == BLOCK_TYPE.IMAGE) {
				event.preventDefault()
				store.addNode({
					path,
					node: { type: "text", children: [{ text: "" }] },
					options: { select: true }
				})
				return
			}
		}
		// se non sto premento contemporaneamente CTRL annulla
		if (!event.ctrlKey) return
		// altrimenti...
		switch (event.key) {
			case 'b': {
				event.preventDefault()
				const [leaf] = store.getEntryTextSelect()
				store.changeSelectText({ bold: !leaf?.bold })
				break
			}
			case 'c': {
				event.preventDefault()
				store.changeSelectTypeAndMerge(BLOCK_TYPE.CHAPTER)
				break
			}
		}
	}
	const handleBold = (e) => {
		e.preventDefault()
		const [leaf] = store.getEntryTextSelect()
		store.changeSelectText({ bold: !leaf?.bold })
		ReactEditor.focus(state.editor)
	}
	const handleItalic = (e) => {
		e.preventDefault()
		const [leaf] = store.getEntryTextSelect()
		store.changeSelectText({ italic: !leaf?.italic })
		ReactEditor.focus(state.editor)
	}
	const handleCode = (e) => {
		e.preventDefault()
		const [leaf] = store.getEntryTextSelect()
		store.changeSelectText({ code: !leaf?.code })
		ReactEditor.focus(state.editor)
	}
	const handleLink = (e) => {
		e.preventDefault()
		const [leaf] = store.getEntryTextSelect()
		store.changeSelectText({ link: !leaf?.link })
		ReactEditor.focus(state.editor)
	}
	const handleChapter = (e) => {
		e.preventDefault()
		store.changeSelectTypeAndMerge(BLOCK_TYPE.CHAPTER)
		ReactEditor.focus(state.editor)
	}
	const handleParagraph = (e) => {
		e.preventDefault()
		store.changeSelectTypeAndMerge(BLOCK_TYPE.PARAGRAPH)
		ReactEditor.focus(state.editor)
	}
	const handleText = (e) => {
		e.preventDefault()
		store.changeSelectTypeAndMerge(BLOCK_TYPE.TEXT)
		ReactEditor.focus(state.editor)
	}
	const handleBlockCode = (e) => {
		e.preventDefault()
		store.changeSelectTypeAndMerge(BLOCK_TYPE.CODE)
		ReactEditor.focus(state.editor)
	}
	const handleImageCode = (e) => {
		e.preventDefault()
		store.changeSelectTypeAndMerge(BLOCK_TYPE.IMAGE)
		ReactEditor.focus(state.editor)
	}

	// RENDER

	return <FrameworkCard
		store={store}
	// actionsRender={<>
	// 	<FormatAction store={msgSo} />
	// </>}
	>
		<Slate
			editor={state.editor}
			initialValue={state.editor.children}

		>
			<Editable
				renderElement={props => <BiblioElement {...props} />}
				renderLeaf={props => <BiblioLeaf {...props} />}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
		</Slate>

		<Dialog noCloseOnClickParent
			store={store}
			title={"PIPPO"}
			width={250}
			open={state.formatOpen}
			onClose={handleFormatClose}
		>
			<div style={{ display: "flex" }}>
				<button
					onClick={handleBold}
				>B</button>
				<button
					onClick={handleItalic}
				>I</button>
				<button
					onClick={handleLink}
				>L</button>
			</div>
			<button
				onClick={handleChapter}
			>CHAPTER</button>
			<button
				onClick={handleParagraph}
			>PARAGRAPH</button>
			<button
				onClick={handleText}
			>TEXT</button>
			<button
				onClick={handleBlockCode}
			>CODE</button>
			<button
				onClick={handleImageCode}
			>IMAGE</button>

		</Dialog>

	</FrameworkCard>
}

export default EditorView

