import layoutSo from "@/stores/layout"
import { FunctionComponent } from "react"



interface Props {
	variant?: number
	style?: React.CSSProperties
}

const Divider: FunctionComponent<Props> = ({
	variant = 0,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return (
		<div style={{...cssLine(variant), ...style}} />
	)
}

export default Divider

const cssLine = (variant: number): React.CSSProperties => ({
	borderTop: `1px solid ${layoutSo.state.theme.palette.var[variant].bg}`
})
