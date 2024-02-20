import dayjs from "dayjs"
import { FunctionComponent, useMemo, useState } from "react"
import TextInput, { TextInputProps } from "./TextInput"



interface Props extends TextInputProps {
	onChange?: (newValue: string | number) => void
}

const DateTimeInput: FunctionComponent<Props> = ({
	...props
}) => {

	// STORE

	// HOOK
	const [valueTmp, setValueTmp] = useState(() => {
		const v = dayjs(props.value)
		if (v.isValid()) return v.format("YYYYMMDDhhmmss")
		return ""
	})

	// HANDLER
	const handleChange = (newValue: string) => {
		setValueTmp(newValue.replace(/\D/g, ''))
		const data = dayjs(newValue).valueOf()
		props.onChange?.(data)
	}

	// RENDER

	// Rimuovi tutti i caratteri non numerici e aggiungi i separatori di data e ora
	const valueShow = useMemo(() => {
		const v = valueTmp
		let valueShow = ""
		for (let i = 0; i < v.length; i++) {
			const char = v[i]
			valueShow += ["-", "-", " ", ":", ":"][[4, 6, 8, 10, 12].indexOf(i)] ?? ""
			valueShow += char
		}
		return valueShow
	}, [valueTmp])

	return (
		<TextInput {...props}
			value={valueShow}
			placeholder="YYYY-MM-DD hh:mm:ss"
			onChange={handleChange}
		/>
	)
}

export default DateTimeInput
