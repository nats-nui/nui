import { BaseElement, BaseText } from "slate"
import { ViewState } from "../../viewBase"
import { COLOR_VAR } from "@/stores/layout"


/**
 * tipi di BLOCK nel documento
 */
export enum NODE_TYPES {
	PARAGRAPH = "paragraph",
	CHAPTER = "chapter",
	CARD = "card",
	TEXT = "text",
	CODE = "code",
	IMAGE = "image",
}

/**
 * Tipi di FORMAT del testo
 */
export enum NODE_FORMATS {
	BOLD = "bold",
	ITALIC = "italic",
	STRIKETHROUGH = "strikethrough",
	CODE = "code",
	LINK = "link",
}

export type ElementType = {
	type?: NODE_TYPES,
} & BaseElement

export type ElementCard = {
	data: Partial<ViewState>
	subtitle?: string
	colorVar?: COLOR_VAR
} & ElementType

export type ElementImage = {
	url: string,
} & ElementType

export type TextType = {
	link?: boolean
	url?: string
	bold?: boolean
	italic?:boolean
	code?:boolean
} & BaseText

export type NodeType = Node & ElementCard & ElementImage & TextType

