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

/** applica il tema al documento: il resto lo fa il CSS */
export function applyTheme(theme: ThemeType) {
	document.documentElement.dataset.theme = theme
}

/** 
 * ruolo di colore di una card: il tema decide il colore effettivo.
 */
export type CardAccent = "streams" | "messages" | "buckets" | "connections" | "consumers" | "metrics" | "neutral"

/** classi CSS di una card */
export function cardCls(accent: CardAccent, filled = false): string {
	return `${!!accent?"card-"+accent:""}${filled ? " card--filled" : ""}`
}
