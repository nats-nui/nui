import { encodeCborPayload } from "@/utils/cbor"
import { binaryStringToString, stringToBinaryString } from "@/utils/string"

export enum MSG_FORMAT {
	JSON = "json",
	TEXT = "text",
	HEX = "hex",
	BASE64 = "base64",
	XML = "xml",
	HTML = "html",
	PROTOBUF = "protobuf",
	CBOR = "cbor",
}
export enum MSG_FORMAT_EDIT {
	JSON = "json",
	TEXT = "text",
	XML = "xml",
	HTML = "html",
	CBOR = "cbor",
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
		case MSG_FORMAT.CBOR:
			return text
	}
}

/** the formats whose viewer reads the bytes of the payload rather than its text */
const BINARY_FORMATS = [MSG_FORMAT.HEX, MSG_FORMAT.BASE64, MSG_FORMAT.PROTOBUF, MSG_FORMAT.CBOR]

/**
 * turns a payload into the text of the editor showing it
 * a binary format is handed the payload as it arrived: decoding it as UTF-8 would corrupt it
 */
export function toEditorText(payload: string, format: MSG_FORMAT): string {
	if (BINARY_FORMATS.includes(format)) return payload ?? ""
	return binaryStringToString(payload ?? "")
}

/**
 * turns the editor text into the payload to send
 * CBOR is written as diagnostic notation, of which JSON is a subset, and encoded here
 */
export function toPayload(text: string, format: MSG_FORMAT): { payload?: string, error?: string } {
	if (format != MSG_FORMAT.CBOR) return { payload: stringToBinaryString(text) }
	// the fields write nothing at all while the rule is still waiting on one of
	// them, and "the payload is empty" is not what the writer needs to hear
	if (!text?.trim()) return { error: "there is nothing to send yet" }
	const encoded = encodeCborPayload(text)
	if (!encoded.success) return { error: [encoded.error, ...encoded.validationErrors ?? []].join("\n") }
	return { payload: encoded.payload }
}