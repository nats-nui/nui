import layoutSo, { COLOR_VAR } from "@/stores/layout"
import React, { ForwardRefRenderFunction, FunctionComponent, InputHTMLAttributes, forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import Label, { LABELS } from "./Label"



export interface TextInputProps {
	value?: string | number
	placeholder?: string
	readOnly?: boolean
	variant?: number
	style?: React.CSSProperties
	focus?: boolean

	onChange?: (newValue: string | number) => void
	onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
	onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

const TextInput: ForwardRefRenderFunction<HTMLElement, TextInputProps> = (
	{
		value,
		placeholder,
		readOnly,
		variant,
		style,
		focus,

		onChange,
		onFocus,
		onKeyDown,
	},
	ref: any
) => {

	// STORE

	// HOOK
	const inputRef = useRef<HTMLInputElement>(null)
	useEffect(() => {
		if (!focus) return
		inputRef.current?.select()
	}, [focus])
	useImperativeHandle(ref, () => inputRef.current, [inputRef.current])

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)
	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		e.target.select()
		onFocus?.(e)
	}

	// RENDER

	if (readOnly) return <Label type={LABELS.READ}>{value}</Label>

	return (
		<input ref={inputRef}
			style={{ ...cssRoot(variant), ...style }}
			placeholder={placeholder}
			className={`var${0}`}
			value={value}
			onChange={handleChange}
			onFocus={handleFocus}
			onKeyDown={onKeyDown}
		/>
	)
}

export default forwardRef(TextInput)

const cssRoot = (variant: number): React.CSSProperties => ({
	//... !noBg && {
	//backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT]?.bg,
	//color: layoutSo.state.theme.palette.var[variant]?.fg,

	borderBottom: "1px solid rgb(0 0 0 / 15%)",
	//border: "1px solid rgb(0 0 0 / 30%)",
	//borderRadius: 3,
	//},
	padding: "4px 3px 3px 3px",
	fontSize: 12,
	fontWeight: 600,
})
