import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"
import Label, { LABELS } from "../format/Label"



interface Props {
	value?: string
	onChange?: (newValue: string) => void
	readOnly?: boolean
	style?: React.CSSProperties
}

const TextArea: FunctionComponent<Props> = ({
	value,
	onChange,
	readOnly,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)

	// RENDER
	if (readOnly) return <Label type={LABELS.READ}>{value}</Label>

	return (
		<textarea style={{ ...cssRoot, ...style }}
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
