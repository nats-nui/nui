import { StoreOf, createStore } from "@priolo/jon"



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

export interface LayoutStore extends StoreOf<typeof setup> {}
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
