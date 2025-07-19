import { describe, it, expect } from 'vitest'
import { calculateTextDifferences } from './textDiff'

describe('calculateTextDifferences', () => {
	it('should return empty array for empty strings', () => {
		const result = calculateTextDifferences('', '')
		expect(result).toEqual([])
	})

	it('should return empty array when oldText is empty', () => {
		const result = calculateTextDifferences('', 'new text')
		expect(result).toEqual([])
	})

	it('should return empty array when newText is empty', () => {
		const result = calculateTextDifferences('old text', '')
		expect(result).toEqual([])
	})

	it('should return empty array when texts are identical', () => {
		const text = 'identical text'
		const result = calculateTextDifferences(text, text)
		expect(result).toEqual([])
	})

	it('should detect single word addition', () => {
		const oldText = 'hello world'
		const newText = 'hello beautiful world'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 1,
			startColumn: 7,
			endLineNumber: 1,
			endColumn: 17
		})
	})

	it('should detect text addition at the beginning', () => {
		const oldText = 'world'
		const newText = 'hello world'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 1,
			startColumn: 1,
			endLineNumber: 1,
			endColumn: 7
		})
	})

	it('should detect text addition at the end', () => {
		const oldText = 'hello'
		const newText = 'hello world'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 1,
			startColumn: 7,
			endLineNumber: 1,
			endColumn: 12
		})
	})

	it('should handle multiline additions', () => {
		const oldText = 'first line\nsecond line'
		const newText = 'first line\nadded line\nsecond line'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 2,
			startColumn: 1,
			endLineNumber: 2,
			endColumn: 11
		})
	})

	it('should handle addition with newline at the end', () => {
		const oldText = 'first line'
		const newText = 'first line\nsecond line'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 2,
			startColumn: 1,
			endLineNumber: 2,
			endColumn: 12
		})
	})

	it('should handle multiple separate additions', () => {
		const oldText = 'first third'
		const newText = 'first second third fourth'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(2)
		expect(result[0]).toEqual({
			startLineNumber: 1,
			startColumn: 7,
			endLineNumber: 1,
			endColumn: 14
		})
		expect(result[1]).toEqual({
			startLineNumber: 1,
			startColumn: 20,
			endLineNumber: 1,
			endColumn: 26
		})
	})

	it('should handle JSON-like text changes', () => {
		const oldText = '{"name": "John", "age": 30}'
		const newText = '{"name": "John", "age": 30, "city": "New York"}'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 1,
			startColumn: 27,
			endLineNumber: 1,
			endColumn: 47
		})
	})

	it('should handle complex multiline text with multiple changes', () => {
		const oldText = 'line 1\nline 2\nline 4'
		const newText = 'line 1\nline 2\nline 3\nline 4'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 3,
			startColumn: 6,
			endLineNumber: 4,
			endColumn: 1
		})
	})

	it('should handle text replacement as removal + addition', () => {
		const oldText = 'hello world'
		const newText = 'hello universe'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 1,
			startColumn: 7,
			endLineNumber: 1,
			endColumn: 14
		})
	})

	it('should handle empty lines in multiline text', () => {
		const oldText = 'line 1\n\nline 3'
		const newText = 'line 1\nline 2\n\nline 3'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 2,
			startColumn: 1,
			endLineNumber: 2,
			endColumn: 6
		})
	})

	it('should handle text with special characters', () => {
		const oldText = 'hello\tworld'
		const newText = 'hello\tbeautiful\tworld'
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 1,
			startColumn: 7,
			endLineNumber: 1,
			endColumn: 16
		})
	})

	it('should handle very long lines', () => {
		const oldText = 'a'.repeat(1000)
		const newText = 'a'.repeat(500) + 'b'.repeat(100) + 'a'.repeat(500)
		const result = calculateTextDifferences(oldText, newText)
		
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			startLineNumber: 1,
			startColumn: 501,
			endLineNumber: 1,
			endColumn: 600
		})
	})
})
