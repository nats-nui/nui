import { MSG_FORMAT } from "../../../utils/editor";



export function getEditorLanguage(format: MSG_FORMAT) {
	return {
		[MSG_FORMAT.JSON]: "json",
		[MSG_FORMAT.TEXT]: "text",
		[MSG_FORMAT.HEX]: "hex",
		[MSG_FORMAT.BASE64]: "base64",
		[MSG_FORMAT.XML]: "xml",
		[MSG_FORMAT.HTML]: "html",
	}[format]
}