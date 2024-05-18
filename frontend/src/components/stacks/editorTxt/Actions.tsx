import Button from "@/components/buttons/Button"
import IconButton from "@/components/buttons/IconButton"
import TextInput from "@/components/input/TextInput"
import ClearIcon from "@/icons/ClearIcon"
import LinkIcon from "@/icons/LinkIcon"
import { TextEditorStore } from "@/stores/stacks/editor"
import { NODE_TYPES, NodeType } from "@/stores/stacks/editor/utils/types"
import { SugarEditor } from "@/stores/stacks/editor/utils/withSugar"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import { ReactEditor, useSlate } from "slate-react"



interface Props {
	store?: TextEditorStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	const state = useStore(store)

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
		const url = (!/^https?:\/\//i.test(urlMark) ? 'http://' : "") + urlMark;
		window.open(url, '_blank');
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

	return (<div
		className="btt-actions"
		style={style}
	>

		<Button select={isBold}
			onClick={handleBold}
		>B</Button>
		<Button select={isItalic}
			style={{ fontStyle: "italic" }}
			onClick={handleItalic}
		>I</Button>
		<Button select={isLink}
			onClick={handleLink}
		>L</Button>

		<div className="lbl-divider-v2" />

		<div style={{ display: "flex", flex: 1, gap: 5 }}>
			{isLink ? <>
				<TextInput style={{ flex: 1, backgroundColor: "#3f3d3d" }}
					value={urlMark}
					onChange={handleUrlChange}
				/>
				<IconButton style={{ padding: 5 }}
					onClick={handleUrlOpen}
				><LinkIcon /></IconButton>
			</> : <>
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
			</>}
		</div>
	</div>)
}

export default ActionsCmp
