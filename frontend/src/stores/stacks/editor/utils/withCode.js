import { BLOCK_TYPE } from "./utils"

/**
 * Extend "withReact" di Slate
 * per gestire il BLOCK "code"
 * @param {*} editor 
 * @returns 
 */
export const withCode = editor => {
	const { normalizeNode, isInline, isVoid } = editor
	// da mettere in un withCode
	/*
	editor.normalizeNode = entry => {

		// node: tutte le info del BLOCK
		// path: dove è posizionato
		const [node, path] = entry

		// se il NODE è di tipo CODE voglio accorparlo con eventuali "vicini"
		if (Element.isElement(node) && node.type == BLOCK_TYPE.CODE) {

			// il prossimo PATH rispetto alla ENTRY
			const pathNext = Path.next(path)
			// controlla che il prossimo PATH esista
			if (Node.has(editor, pathNext) == false) return
			// preleva il NODE del prossimo PATH
			const nodeNext = Node.get(editor, pathNext)

			// preleva tutti i nodes secondo un qualche critetio
			//const nodes = [...Editor.nodes(editor, { at: [path, nextPath] })]
			// preleva un nodo in base ad una path
			//const node1 = Editor.node(editor, path) 

			// quindi se il NODE è anc'esso di tipo CODE fa il "merge"
			if (nodeNext.type == BLOCK_TYPE.CODE) {
				Transforms.mergeNodes(editor, { at: pathNext, voids: true, hanging: true })
				// esco perche' questa stessa funzione sara' richiamata nuovamente dopo il "Transform"
				return
			}
		}

		normalizeNode(entry)
	}
	*/
	// editor.isInline = element => {
	// 	return element.type == BLOCK_TYPE.CODE ? true : isInline(element)
	// }
	// indico i BLOCK di tipo VOID (non editabili)
	editor.isVoid = element => {
		return element.type == BLOCK_TYPE.CODE ? true : isVoid(element)
	}

	return editor
}
