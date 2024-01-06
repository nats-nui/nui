import layoutSo, { COLOR_VAR } from "@/stores/layout"
import React, { FunctionComponent, useEffect, useRef } from "react"
import Label, { LABELS } from "./Label"



interface Props {
	value?: string
	placeholder?: string
	readOnly?: boolean
	variant?: number
	style?: React.CSSProperties
	focus?: boolean
	onChange?: (newValue: string) => void
	onFocus?: () => void
	onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

const TextInput: FunctionComponent<Props> = ({
	value,
	placeholder,
	readOnly,
	variant,
	style,
	focus,
	onChange,
	onFocus,
	onKeyDown,
}) => {

	// STORE

	// HOOK
	const inputRef = useRef<HTMLInputElement>(null)
	useEffect(() => {
		if (!focus) return
		inputRef.current?.select()
	}, [focus])

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)
	const handleFocus = (e) => {
		e.target.select()
		onFocus?.()
	}

	// RENDER

	if (readOnly) return <Label type={LABELS.READ}>{value}</Label>

	return (
		<input ref={inputRef}
			style={{ ...cssRoot(), ...style }}
			placeholder={placeholder}
			className={`var${variant}`}
			value={value}
			onChange={handleChange}
			onFocus={handleFocus}
			onKeyDown={onKeyDown}
		/>
	)
}

export default TextInput

const cssRoot = (): React.CSSProperties => ({
	//... !noBg && {
	backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT]?.bg,
	color: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT]?.fg,
	borderRadius: 3,
	//},
	padding: '5px 7px',
	fontSize: 12,
	fontWeight: 600,
})
