import "./base.css"
import "./redeye.css"
import "./boring.css"
import "./zero.css"
import "./mint.css"
import "./sole.css"


export const THEMES = [
	{ label: "RED EYE", value: "redeye" },
	{ label: "BORING", value: "boring" },
	{ label: "ZERO", value: "zero" },
	{ label: "MINT", value: "mint" },
	{ label: "SOLE", value: "sole" },
] as const

export type ThemeType = typeof THEMES[number]["value"]

/** Apply the theme to the document: CSS handles the rest. */
export function applyTheme(theme: ThemeType) {
	document.documentElement.dataset.theme = theme
}

/** 
 * A card's color role: the theme determines the actual color.
 */
export type CardAccent = "streams" | "messages" | "buckets" | "connections" | "consumers" | "metrics" | "neutral"

/** CSS classes of a card */
export function cardCls(accent: CardAccent, filled = false): string {
	return `${!!accent?"card-"+accent:""}${filled ? " card--filled" : ""}`
}
