import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"
import Label, { LABEL_TYPES } from "./Label"



interface Props {
	value?: string
	onChange?: (newValue: string) => void
	readOnly?: boolean
	variant?: number
	style?: React.CSSProperties
}

const TextInput: FunctionComponent<Props> = ({
	value,
	onChange,
	readOnly,
	variant = 0,
	style,
}) => {

	// STORE

	// HOOK

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)

	// RENDER
	return (!readOnly ? (
		<input style={{ ...cssRoot, ...style }}
			className={`var${variant}`}
			value={value}
			onChange={handleChange}
		/>
	) : (
		<Label type={LABEL_TYPES.TEXT}>{value}</Label>
	))
}

export default TextInput

const cssRoot: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
	padding: '5px 7px',
}
