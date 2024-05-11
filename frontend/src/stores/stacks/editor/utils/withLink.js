import { BLOCK_TYPE } from "./utils"
import { Editor } from 'slate'
import { eq } from "@priolo/jon-utils"


export function withLink(editor) {
	const { insertData } = editor

	editor.insertData = (data) => {
		const fnOrigin = insertData(data)
		if (!fnOrigin) return null

		const text = data.getData('text/plain')
		if (eq.isUrl(text)) {
			Editor.insertNode(editor, {
				type: BLOCK_TYPE.TEXT, 
				children: [{ 
					link: true,
					text: text, 
					url: text,
				}]
			})
			return null
		}
		return fnOrigin
	}
	return editor
}