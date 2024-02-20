import { FunctionComponent } from "react"
import TextInput, { TextInputProps } from "./TextInput"



interface Props extends TextInputProps {
	min?: number
	max?: number
	decimals?: number
	onChange?: (newValue: string | number) => void
}

const NumberInput: FunctionComponent<Props> = ({
	decimals,
	min,
	max,
	...props
}) => {

	// STORE

	// HOOK

	// HANDLER
	const handleChange = (newValue: string) => {
		const valueNum = format(newValue, decimals, min, max)
		props.onChange?.(valueNum)
	}
	const handleBlur = () => {
		let num = Number.parseFloat(props.value as string)
		if (num == null || isNaN(num)) num = 0
		props.onChange?.(num)
	}

	// RENDER
	return <TextInput {...props}
		onChange={handleChange}
		onBlur={handleBlur}
	/>
}

export default NumberInput

function format(value: string, decimals?: number, min?: number, max?: number, isInt?: boolean): string {
	// lascio solo le cose "numerose"
	value = value.replace(/[^0-9.,+-]/g, "")

	if (value == null || value.length == 0 || Number.isNaN(value)) return ""

	// elimino i decimali di troppo
	if (decimals != null && (value.includes(".") || value.includes(","))) {
		value = parseFloat(value).toString()//.toFixed(decimals)
		value = value.replace(/,/g, ".");
		const index = value.indexOf(".")
		if (index != -1 && (value.length - index - 1) > decimals) {
			value = value.slice(0, index + decimals + 1)
		}
	}
	// trasformo in numero per capire se è nei limiti
	let valueNum = Number(value)//isInt ? parseInt(value) : parseFloat(value)
	if (min != null && valueNum < min) value = min.toString()
	if (max != null && valueNum > max) value = max.toString()

	return value
}
