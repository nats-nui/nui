import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"



interface Props {
	value?: string
	onChange?: (newValue: string) => void
	style?: React.CSSProperties
	variant?: number
}

const TextArea: FunctionComponent<Props> = ({
	value,
	onChange,
	style,
	variant = 0,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)

	// RENDER
	return (
		<textarea style={{ ...cssRoot, ...style }}
			className={`var${variant}`}
			value={value}
			onChange={handleChange}
		/>
	)
}

export default TextArea

const cssRoot: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
	padding: '5px 7px',
}
