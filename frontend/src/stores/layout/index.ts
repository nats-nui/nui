import { StoreCore, createStore } from "@priolo/jon"
import { Theme } from "./utils"

export enum COLOR_VAR {
	DEFAULT = 0,
	GREEN,
	CYAN,
	MINT,
	YELLOW,
	FUCHSIA,
	GENERIC,
}

const ThemeDefault: Theme = {
	palette: {
		var: [
			// default
			{
				bg: "#3E3E3E",
				bg2: "#474747",
				fg: "#DEDEDE",
				fg2: "#B1B1B1"
			},
			// green
			{ bg: "#BBFB35", fg: "#393939" },
			// cyan
			{ bg: "#10F3F3", fg: "#393939" },
			// mint
			{ bg: "#6affab", fg: "#393939" },
			// yellow
			{ bg: "#ebfb35", fg: "#393939", bg2: "#f9ffb3" },
			// fuchsia
			{ bg: "#F51DDF", fg: "#393939", bg2: "#f374e6" },
			// generic
			{ bg: "#FFFFFF", fg: "#393939", bg2: "#f374e6" },

		],
		default: {
			bg: "#3E3E3E",
			bg2: "#474747",
			fg: "#DEDEDE",
			fg2: "#B1B1B1",
		},
		actionsGroup: {
			bg: "#2e2e2e",
			fg: "#DEDEDE",
		},
	},

	texts: {
		row: {
			title: { fontSize: 14, fontWeight: 700 },
			subtitle: { opacity: .8, fontSize: 12, fontWeight: 500 },
		},
		rowButton: { fontSize: 14, fontWeight: 800, fontFamily: "Darker Grotesque" },
	},

	shadows: [
		'rgba(0, 0, 0, 0.4) 1px 1px 0px 0px'
	],

	transitions: [
		"cubic-bezier(0.000, 0.350, 0.225, 1.175)",
		"cubic-bezier(0.38, 0.2, 0.91, 0.42)",
	]
}

const setup = {

	state: {
		/** TEMA GLOBALE */
		theme: ThemeDefault
	},

	getters: {
	},

	actions: {

	},

	mutators: {
		setTheme: (theme: Theme) => ({ theme }),
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


