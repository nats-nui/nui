import layoutSo from "@/stores/layout"
import React, { FunctionComponent, useEffect, useRef } from "react"
import Label, { LABEL_TYPES } from "./Label"



interface Props {
	value?: string
	readOnly?: boolean
	variant?: number
	style?: React.CSSProperties
	focus?: boolean

	onChange?: (newValue: string) => void
	onFocus?: () => void
}

const TextInput: FunctionComponent<Props> = ({
	value,
	readOnly,
	variant = 0,
	style,
	focus,

	onChange,
	onFocus,	
}) => {

	// STORE

	// HOOK
	const inputRef = useRef<HTMLInputElement>(null)
	useEffect(()=>{
		if ( !focus ) return 
		inputRef.current?.select()
	},[focus])

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)

	// RENDER
	return (!readOnly ? (
		<input ref={inputRef}
			style={{ ...cssRoot, ...style }}
			className={`var${variant}`}
			value={value}
			onChange={handleChange}
			onFocus={onFocus}
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
