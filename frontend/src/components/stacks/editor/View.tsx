import FrameworkCard from "@/components/cards/FrameworkCard"
import { TextEditorState, TextEditorStore } from "@/stores/stacks/editor"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./View.module.css"
import { Editable, Slate } from "slate-react"



interface Props {
	store?: TextEditorStore
}

/** dettaglio di un messaggio */
const EditorView: FunctionComponent<Props> = ({
	store: txtEditorSo,
}) => {

	// STORE
	const txtEditorSa = useStore(txtEditorSo) as TextEditorState

	// HOOKs

	// HANDLER

	// RENDER

	return <FrameworkCard
		store={txtEditorSo}
	// actionsRender={<>
	// 	<FormatAction store={msgSo} />
	// </>}
	>
		<Slate
			editor={txtEditorSa.editor}
			initialValue={initialValue}
		>
			<Editable />
		</Slate>
	</FrameworkCard>
}

export default EditorView

const initialValue = [
	{
		type: 'paragraph',
		children: [{ text: 'A line of text in a paragraph.' }],
	},
]