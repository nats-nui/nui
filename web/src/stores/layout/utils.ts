import { Color } from "@/types"

export interface Theme {
	palette: {
		bg: {
			default: Color
			light: Color
			actionsGroup: Color,
			acid: Color[]
		}
		fg: {
			default: Color
			acid: Color[]
		}
	},
	texts: {
		title: React.CSSProperties
		row: {
			title: React.CSSProperties
			subtitle: React.CSSProperties
		}
		button: React.CSSProperties
	},
}