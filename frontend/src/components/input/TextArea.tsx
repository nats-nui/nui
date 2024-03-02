import React, { FunctionComponent } from "react"
import Label, { LABELS } from "../format/Label"

// DA ELIMINARE

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
			autoComplete="off"
			spellCheck="false"
			value={value}
			onChange={handleChange}
		/>
	)
}

export default TextArea

const cssRoot: React.CSSProperties = {
}
