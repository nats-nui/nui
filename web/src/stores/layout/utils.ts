import { Color } from "@/types"

export interface Theme {
	palette: {
		var: ColorVariant[]
		default: ColorVariant
		actionsGroup: ColorVariant


	},
	texts: {
		title: React.CSSProperties
		row: {
			title: React.CSSProperties
			subtitle: React.CSSProperties
		}
		button: React.CSSProperties
		rowButton: React.CSSProperties
	},
	shadows: string[]
}

type ColorVariant = {
	bg?: Color
	bg2?: Color
	fg?: Color
}