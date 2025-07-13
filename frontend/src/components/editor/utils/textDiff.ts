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
			
			const startLine = line
			const startColumn = column
			const endLine = startLine + numRC
			const returnIndex = change.value.indexOf('\n')
			const endColumn = returnIndex == -1
				? startColumn + change.value.length
				: startColumn + returnIndex - 1

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
