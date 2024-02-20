import { FunctionComponent } from "react"
import TextInput, { TextInputProps } from "./TextInput"



interface Props extends TextInputProps {
	min?: number,
	max?: number,
	decimals?: number,
	onNumberChange?: (value: number) => void
}

const NumberInput: FunctionComponent<Props> = ({
    decimals,
    min,
	max,
    isInt,
	...props
}) => {

	// STORE

	// HOOK

	// HANDLER
	const handleChange = (newValue:string) => {
		const valueNum = format(newValue, decimals, min, max, isInt)
		props.onChange?.(valueNum)
	}

	const handleNumberChange = (newValue: string) => {
		const valueNum = isInt ? parseInt(newValue) : parseFloat(newValue)
		props.onNumberChange?.(valueNum)
	}

	// RENDER
	return <TextInput {...props}
		onChange={handleNumberChange}
	/>
}

export default NumberInput

function format(value: string, decimals?: number, min?: number, max?: number, isInt?: boolean): string {
	value = value.replace(/[^0-9.,+-]/g, "")
	if (decimals != null && (value.includes(".") || value.includes(","))) {
		value = parseFloat(value).toString()//.toFixed(decimals)
		value = value.replace(/,/g, ".");
		const index = value.indexOf(".")
		if (index != -1 && (value.length - index - 1) > decimals) {
			value = value.slice(0, index + decimals + 1)
		}
	}
	let valueNum = isInt ? parseInt(value) : parseFloat(value)
	if (min != null && valueNum < min) value = min.toString()
	if (max != null && valueNum > max) value = max.toString()
	return value
}
