import { StoreOf, createStore } from "@priolo/jon"
import { ThemeType, applyTheme } from "@/themes"



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
			applyTheme(theme)
			return { theme }
		},
	},
}

export interface LayoutStore extends StoreOf<typeof setup> { }
const layoutSo = createStore(setup) as LayoutStore
export default layoutSo

async function loadConfig() {
	const res = await fetch("/config.json")
	const config: any = await res.json()
	const theme = (localStorage.getItem('theme') ?? config.theme ?? 'redeye') as ThemeType
	layoutSo.state.theme = theme
	applyTheme(theme)
}
loadConfig();
