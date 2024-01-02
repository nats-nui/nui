
export interface HistoryMessage {
	id: string
	timestamp: number
	title?: string
	body?: string
	type?: MSG_TYPE
	height?: number
}

export enum MSG_FORMAT {
	JSON = "json",
	TEXT = "text",
	HEX = "hex",
	BASE64 = "base64",
}

export enum MSG_TYPE {
	MESSAGE,
	INFO,
	WARNING,
	ERROR,
}

export function toJson(text: string): JSON {
	let json = null
	try { json = JSON.parse(text) } catch { }
	return json
}

export function toHex(text: string): string[] {
	let hex:string[] = []
	for (let i = 0; i < text.length; i++) {
		const charCode = text.charCodeAt(i)?.toString(16)?.toUpperCase()
		hex.push ( charCode.length === 1 ? '0' + charCode : charCode )
	}
	return hex
}

export function toBin(text: string): number[] {
	let bin:number[] = []
	for (let i = 0; i < text.length; i++) {
		bin.push( text.charCodeAt(i))
	}
	return bin
}