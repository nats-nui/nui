import { FunctionComponent, useEffect, useState } from "react"
import TextInput, { TextInputProps } from "./TextInput"



interface Props extends TextInputProps {
	min?: number
	max?: number
	decimals?: number
	onChange?: (newValue: string | number) => void
	value?: number
}

const NumberInput: FunctionComponent<Props> = ({
	decimals,
	min,
	max,
	value,
	...props
}) => {

	// STORE
	const [txtValue, setTxtValue] = useState<string>(() => value?.toString() ?? "")

	// HOOK
	useEffect(() => {
		if (value == null) {
			setTxtValue("")
		} else if (!Number.isNaN(value)) {
			setTxtValue(value.toString())
		}
	}, [value])

	// HANDLER
	const handleChange = (newValue: string) => {
		// lascio solo le cose "numerose"
		newValue = newValue == null || newValue.length == 0 ? "" : newValue.replace(decimals > 0 ? /[^0-9.,+-]/g : /[^0-9+-]/g, "")
		const value = Number.parseFloat(newValue)
		if (!Number.isNaN(value)) {
			props.onChange?.(value)
			if (value != value) return
		}
		setTxtValue(newValue)

	}
	const handleBlur = () => {
		let num = Number.parseFloat(txtValue)
		if (num == null || isNaN(num)) num = 0
		if (min != null && num < min) num = min
		if (max != null && num > max) num = max
		if (decimals != null) {
			const p = 10 ** decimals
			num = Math.floor(num * p) / p
		}
		props.onChange?.(num)
		setTxtValue(num.toString())
	}

	// RENDER
	return <TextInput {...props}
		value={txtValue}
		onChange={handleChange}
		onBlur={handleBlur}
	/>
}

export default NumberInput

// function format(value: string, decimals?: number, min?: number, max?: number, isInt?: boolean): string {
// 	// lascio solo le cose "numerose"
// 	value = value.replace(/[^0-9.,+-]/g, "")

// 	if (value == null || value.length == 0) return ""
// 	if (Number.isNaN(value)) return value

// 	// elimino i decimali di troppo
// 	if (decimals != null && (value.includes(".") || value.includes(","))) {
// 		value = parseFloat(value).toString()//.toFixed(decimals)
// 		value = value.replace(/,/g, ".");
// 		const index = value.indexOf(".")
// 		if (index != -1 && (value.length - index - 1) > decimals) {
// 			value = value.slice(0, index + decimals + 1)
// 		}
// 	}
// 	// trasformo in numero per capire se è nei limiti
// 	let valueNum = Number(value)//isInt ? parseInt(value) : parseFloat(value)

// 	if (valueNum == null || Number.isNaN(valueNum)) return value

// 	if (min != null && valueNum < min) value = min.toString()
// 	if (max != null && valueNum > max) value = max.toString()
// 	return value
// }
