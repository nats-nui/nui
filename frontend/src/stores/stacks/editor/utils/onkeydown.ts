import { Range } from "slate"
import { NODE_TYPES, NodeType } from "./types"
import { SugarEditor } from "./withSugar"



export function biblioOnKeyDown(event: React.KeyboardEvent<HTMLDivElement>, editor: SugarEditor) {
	const node = editor.node(editor.selection, { depth: 1 })?.[0] as NodeType
	const fn = {
		[NODE_TYPES.CODE]: codeOnKeyDown,
		[NODE_TYPES.TEXT]: textOnKeyDown,
		[NODE_TYPES.CARD]: cardOnKeyDown,
	}[node.type]
	if (fn?.(event, editor, node) === false) return
	leafOnKeyDown(event, editor, node)
}


function codeOnKeyDown(event: React.KeyboardEvent<HTMLDivElement>, editor: SugarEditor, node: NodeType) {
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
	} else if (event.key == "Tab") {
		event.preventDefault();
		if (!editor.selection) return
		// Get the selected text
		const [start, end] = Range.edges(editor.selection);
		// Apply the tab character (or spaces for tab)
		const tab = '   '; // You can replace this with '\t' if you want a real tab character
		editor.insertText(tab, { at: start });
		// Move the cursor after the inserted tab
		//editor.move({ distance: tab.length, unit: 'character' });
	}
}

function cardOnKeyDown(event: React.KeyboardEvent<HTMLDivElement>, editor: SugarEditor, node: NodeType) {
	if (event.key == "Enter") {
		event.preventDefault()
		const at = editor.after(editor.selection) ?? [editor.selection?.focus?.path?.[0] + 1]
		editor.insertNode(
			{ type: NODE_TYPES.TEXT, children: [{ text: '' }] } as NodeType,
			{ at }
		)
		editor.select(at)
	} else if (event.key === 'Backspace' || event.key === 'Delete') {
		editor.removeNodes({ at: editor.selection })
	}

}

function textOnKeyDown(event: React.KeyboardEvent<HTMLDivElement>, editor: SugarEditor, node: NodeType) {
	if (event.key == "Enter") {
		if (event.ctrlKey || event.altKey || event.shiftKey) {
			event.preventDefault();
			editor.insertText("\n")
			return false
		}
	}
}

function leafOnKeyDown(event: React.KeyboardEvent<HTMLDivElement>, editor: SugarEditor, node: NodeType) {
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
	}
}