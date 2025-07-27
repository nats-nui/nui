import { IRange } from "monaco-editor"
import { diffWords } from "diff"



/**
 * Calculates the differences between two JSON strings and returns the changed regions
 */
export function calculateTextDifferences(oldText: string, newText: string): IRange[] {
	if (!oldText || !newText) return []

	const changes = diffWords(oldText, newText)
	let line = 1
	let column = 1

	const differences: IRange[] = []
	for (let change of changes) {

		if (change.removed) continue

		const numRC = (change.value.match(/\n/g) || []).length

		if (change.added) {

			let value = change.value
			let nRC = numRC
			let lastRC = value.lastIndexOf('\n')
			if (lastRC == value.length - 1) {
				value = value.slice(0, -1)
				lastRC = value.lastIndexOf('\n')
				nRC--
			}

			const startLine = line
			const startColumn = column
			const endLine = startLine + nRC
			let endColumn = startColumn
			if (nRC == 0) {
				endColumn += value.length
			} else {
				const deltaRC = lastRC - value.length + 1
				endColumn += deltaRC
			}

			differences.push({
				startLineNumber: startLine,
				startColumn: startColumn,
				endLineNumber: endLine,
				endColumn: endColumn
			})
		}

		line += numRC
		const returnIndex = change.value.lastIndexOf('\n')
		if (returnIndex == -1) {
			column += change.value.length
		} else {
			column += change.value.length - returnIndex - 1
		}
	}

	return differences
}
