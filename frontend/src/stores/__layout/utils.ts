import { Color } from "@/types"

export interface Theme {
	palette: {
		var: ColorVariant[]
		default: ColorVariant
		actionsGroup: ColorVariant
	},
	texts: {
		row: {
			title: React.CSSProperties
			subtitle: React.CSSProperties
		}
		rowButton: React.CSSProperties
	},
	shadows: string[],
	transitions?: string[]
}

export type ColorVariant = {
	bg?: Color
	bg2?: Color
	fg?: Color
	fg2?: Color
}