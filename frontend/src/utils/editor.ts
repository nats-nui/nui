
export enum MSG_FORMAT {
	JSON = "json",
	TEXT = "text",
	HEX = "hex",
	BASE64 = "base64",
	XML = "xml",
	HTML = "html",
	PROTOBUF = "protobuf",
}
export enum MSG_FORMAT_EDIT {
	JSON = "json",
	TEXT = "text",
	XML = "xml",
	HTML = "html",
}

/** trasforma una stringa in un JSON gestendo gl errori */
export function toJson(text: string): { json: JSON, success: boolean } {
	let json = null
	let success = false
	try {
		json = JSON.parse(text)
		success = true
	} catch {
		success = false
	}
	return { json, success }
}

export function toHex(text: string): string[] {
	let hex: string[] = []
	for (let i = 0; i < text.length; i++) {
		const charCode = text.charCodeAt(i)?.toString(16)?.toUpperCase()
		hex.push(charCode.length === 1 ? '0' + charCode : charCode)
	}
	return hex
}

export function toBin(text: string): number[] {
	let bin: number[] = []
	for (let i = 0; i < text.length; i++) {
		bin.push(text.charCodeAt(i))
	}
	return bin
}

export function toFormat(text: string, format: MSG_FORMAT): string {
	if ( text == null ) return ""
	switch (format) {
		case MSG_FORMAT.JSON:
			return JSON.stringify(JSON.parse(text), null, 2)
		case MSG_FORMAT.TEXT:
			return text
		case MSG_FORMAT.HEX:
			return toHex(text).join(' ')
		case MSG_FORMAT.BASE64:
			return btoa(text)
		case MSG_FORMAT.XML:
			return text
		case MSG_FORMAT.HTML:
			return text
		case MSG_FORMAT.PROTOBUF:
			return text
	}
}