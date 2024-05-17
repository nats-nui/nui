import Button from "@/components/buttons/Button"
import IconButton from "@/components/buttons/IconButton"
import Dialog from "@/components/dialogs/Dialog"
import TextInput from "@/components/input/TextInput"
import ClearIcon from "@/icons/ClearIcon"
import { TextEditorState, TextEditorStore } from "@/stores/stacks/editor"
import { NODE_TYPES, NodeType } from "@/stores/stacks/editor/utils/types"
import { SugarEditor } from "@/stores/stacks/editor/utils/withSugar"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import { ReactEditor, useSlate } from "slate-react"
import cls from "./FormatDialog.module.css"



interface Props {
	store?: TextEditorStore
}

const FormatDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store) as TextEditorState

	// HOOKs
	const editor = useSlate() as SugarEditor
	const [url, setUrl] = useState("")

	// HANDLER
	const handleFormatClose = () => {
		store.setFormatOpen(false)
	}
	const handleBold = (e) => {
		e.preventDefault()
		editor.addMark('bold', !isBold)
		ReactEditor.focus(editor)
	}
	const handleItalic = (e) => {
		e.preventDefault()
		editor.addMark('italic', !isItalic)
		ReactEditor.focus(editor)
	}
	const handleCode = (e) => {
		e.preventDefault()
		editor.addMark('code', true)
		ReactEditor.focus(editor)
	}
	const handleLink = (e) => {
		e.preventDefault()
		editor.addMark('link', !isLink)
		ReactEditor.focus(editor)
	}
	const handleUrlChange = (value: string) => {
		setUrl(value)
		editor.addMark('url', value)
	}
	const handleUrlOpen = () => {
		window.open(urlMark)
	}


	const handleChapter = (e) => {
		e.preventDefault()
		editor.setTypeOnSelect(NODE_TYPES.CHAPTER)
		ReactEditor.focus(editor)
	}
	const handleParagraph = (e) => {
		e.preventDefault()
		editor.setTypeOnSelect(NODE_TYPES.PARAGRAPH)
		ReactEditor.focus(editor)
	}
	const handleText = (e) => {
		e.preventDefault()
		editor.setTypeOnSelect(NODE_TYPES.TEXT)
		//Transforms.setNodes<NodeType>(state.editor, { type: NODE_TYPES.TEXT }, { split: false })
		ReactEditor.focus(editor)
	}
	const handleBlockCode = (e) => {
		e.preventDefault()
		editor.setTypeOnSelect(NODE_TYPES.CODE)
		ReactEditor.focus(editor)
	}
	// const handleImageCode = (e) => {
	// 	e.preventDefault()
	// 	editor.setTypeOnSelect(NODE_TYPES.IMAGE)
	// 	ReactEditor.focus(editor)
	// }


	// RENDER
	const node = editor.selection ? editor.node(editor.selection.focus, { depth: 1 })?.[0] as NodeType : null
	const type = node?.type
	const marks = editor.getMarks()
	const isBold = marks?.["bold"] === true
	const isItalic = marks?.["italic"] === true
	const isLink = marks?.["link"] === true
	const urlMark = marks?.["url"] ?? ""

	return (
		<Dialog noCloseOnClickParent
			className="var-dialog"
			store={store}
			title={"PIPPO"}
			width={85}
			open={state.formatOpen}
			onClose={handleFormatClose}
		>
			<div className="lyt-form">

				<div className={cls.btts}>
					<Button select={isBold}
						onClick={handleBold}
					>B</Button>
					<Button select={isItalic}
						onClick={handleItalic}
					>I</Button>
					<Button select={isLink}
						onClick={handleLink}
					>L</Button>
				</div>

				{isLink && <div style={{ display: "flex" }}>
					<TextInput
						value={urlMark}
						onChange={handleUrlChange}
					/>
					<IconButton onClick={handleUrlOpen}
					><ClearIcon /></IconButton>
				</div>}

				<Button select={type == NODE_TYPES.CHAPTER}
					onClick={handleChapter}
				>CHAPTER</Button>
				<Button select={type == NODE_TYPES.PARAGRAPH}
					onClick={handleParagraph}
				>PARAGRAPH</Button>
				<Button select={type == NODE_TYPES.TEXT}
					onClick={handleText}
				>TEXT</Button>
				<Button select={type == NODE_TYPES.CODE}
					onClick={handleBlockCode}
				>CODE</Button>
				{/* <Button select={type == NODE_TYPES.IMAGE}
					onClick={handleImageCode}
				>IMAGE</Button> */}

			</div>
		</Dialog>
	)

}

export default FormatDialog

