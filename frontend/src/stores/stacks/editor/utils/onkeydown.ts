import { NODE_TYPES, NodeType } from "./types"
import { SugarEditor } from "./withSugar"



export function biblioOnKeyDown (event: React.KeyboardEvent<HTMLDivElement>, editor: SugarEditor)  {
	const node = editor.node(editor.selection, { depth: 1 })?.[0] as NodeType
	const fn = {
		[NODE_TYPES.CODE]: codeOnKeyDown,
		[NODE_TYPES.TEXT]: textOnKeyDown,
	}[node.type]
	if ( fn?.(event, editor, node) === false) return
	leafOnKeyDown(event, editor, node)
}


function codeOnKeyDown (event:React.KeyboardEvent<HTMLDivElement>, editor:SugarEditor, node: NodeType) {
	console.log(event, editor)

	if (event.key == "Enter") {
		if (event.ctrlKey || event.altKey || event.shiftKey) {
				event.preventDefault();
				editor.insertBreak()
				return false
		} else {
				event.preventDefault();
				editor.insertText("\n")
				return false
		}
	}
}

function textOnKeyDown (event: React.KeyboardEvent<HTMLDivElement>, editor: SugarEditor, node: NodeType) {
	if (event.key == "Enter") {
		if (event.ctrlKey || event.altKey || event.shiftKey) {
			event.preventDefault();
			editor.insertText("\n")
			return false
		}
	}
}

function leafOnKeyDown (event: React.KeyboardEvent<HTMLDivElement>, editor: SugarEditor, node: NodeType) {
	
	// se non sto premento contemporaneamente CTRL annulla
	if (!event.ctrlKey) return
	// altrimenti...
	switch (event.key) {
		case 'b': {
			event.preventDefault()
			const marks = editor.marks
			const isBold = marks ? marks["bold"] === true : false
			editor.addMark('bold', !isBold)
			break
		}
		case 'i': {
			event.preventDefault()
			const marks = editor.marks
			const isItalic = marks ? marks["italic"] === true : false
			editor.addMark('italic', !isItalic)
			break
		}
		// case 'c': {
		// 	event.preventDefault()
		// 	const index = editor.selection?.anchor?.path?.[0]
		// 	const node = editor.node([index])
		// 	editor.removeNodes({ at: [index] })
		// 	break
		// }
	}
}