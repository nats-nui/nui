import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"



interface Props {
	value?: string
	onChange?: (newValue: string) => void
	style?: React.CSSProperties
}

const TextInput: FunctionComponent<Props> = ({
	value,
	onChange,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)

	// RENDER
	return (
		<input style={{ ...cssRoot, ...style }}
			value={value}
			onChange={handleChange}
		/>
	)
}

export default TextInput

const cssRoot: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
	//border: 'none',
	padding: '5px 7px',
}
