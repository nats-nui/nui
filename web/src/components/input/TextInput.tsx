import React, { FunctionComponent } from "react"
import layoutSo, { LayoutState } from "@/stores/layout"
import { useStore } from "@priolo/jon"



interface Props {
	value?: string
	onChange?: (newValue: string) => void
}

const TextInput: FunctionComponent<Props> = ({
	value,
	onChange,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)

	// RENDER
	return (
		<input style={cssRoot}
			value={value}
			onChange={handleChange}
		/>
	)
}

export default TextInput

const cssRoot: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
	border: 'none',
	padding: '5px 7px',
}
