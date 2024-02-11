import { FunctionComponent } from "react"
import TextInput, { TextInputProps } from "./TextInput"



interface Props extends TextInputProps {
	min?: number,
	max?: number,
	decimals?: number,
}

const NumberInput: FunctionComponent<Props> = ({
	min,
	max,
	decimals,
	...props
}) => {

	// STORE

	// HOOK

	// HANDLER
	const handleChange = (newValue:string) => {
		const value = format(newValue, decimals, min, max)
		props.onChange?.(value)
	}

	// RENDER
	return <TextInput {...props} 
		onChange={handleChange}
	/>
}

export default NumberInput

function format(value: string, decimals?: number, min?: number, max?: number): string {
	value = value.replace(/[^0-9.,+-]/g, "")
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
