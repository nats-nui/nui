import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"
import Label, { LABEL_TYPES } from "./Label"



interface Props {
	value?: any
	readOnly?: boolean
	variant?: number
	style?: React.CSSProperties

	min?:number,
	max?:number,
	decimals?:number,

	onChange?: (newValue: string) => void
	onFocus?: () => void
}

const NumberInput: FunctionComponent<Props> = ({
	value,
	readOnly,
	variant = 0,
	style,

	min,
	max,
	decimals,

	onChange,
	onFocus,	
}) => {

	// STORE

	// HOOK

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = format(e.target.value, decimals, min, max)
		onChange?.(value)
	}

	// RENDER
	return (!readOnly ? (
		<input style={{ ...cssRoot, ...style }}
			type="number"
			className={`var${variant}`}
			value={value}
			onChange={handleChange}
			onFocus={onFocus}
		/>
	) : (
		<Label type={LABEL_TYPES.TEXT}>{value}</Label>
	))
}

export default NumberInput

const cssRoot: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
	padding: '5px 7px',
}

function format(value: string, decimals?: number, min?: number, max?: number): any {
	if (decimals != null && (value.includes(".") || value.includes(","))) {
		value = parseFloat(value).toString()//.toFixed(decimals)
		value = value.replace(/,/g, ".");
		const index = value.indexOf(".")
		if (index != -1 && (value.length - index - 1) > decimals) {
		 	value = value.slice(0, index + decimals + 1)
		}
	}
	let valueNum = parseFloat(value)
	if (min != null && valueNum < min) value = min.toString()
	if (max != null && valueNum > max) value = max.toString()
	return value
}
