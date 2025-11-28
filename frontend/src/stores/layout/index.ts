import { StoreCore, createStore } from "@priolo/jon"



const setup = {

	state: {
		theme: <ThemeType>"redeye"
	},

	getters: {
	},

	actions: {

	},

	mutators: {
		setTheme: (theme: ThemeType) => {
			localStorage.setItem('theme', theme)
			return { theme }
		},
	},
}

export type LayoutState = typeof setup.state
export type LayoutGetters = typeof setup.getters
export type LayoutActions = typeof setup.actions
export type LayoutMutators = typeof setup.mutators
export interface LayoutStore extends StoreCore<LayoutState>, LayoutGetters, LayoutActions, LayoutMutators {
	state: LayoutState
}
const layoutSo = createStore(setup) as LayoutStore
export default layoutSo

export type ThemeType = "redeye" | "boring"

export const THEMES: { label: string, value: ThemeType }[] = [
	{ label: "RED EYE", value: "redeye" },
	{ label: "BORING", value: "boring" },
]

async function loadConfig() {
	const res = await fetch("/config.json")
	const config:any = await res.json()
	layoutSo.state.theme = (localStorage.getItem('theme') ?? config.theme ?? 'redeye') as ThemeType
}
loadConfig();
