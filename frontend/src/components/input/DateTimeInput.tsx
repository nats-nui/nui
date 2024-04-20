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
	
	// HANDLER
	const handleBlur = () => {
		const v = dayjs(props.value)
		props.onChange(v.isValid() ? v.format("YYYY-MM-DD HH:mm:ss") : "")
	}

	// RENDER
	return (
		<TextInput {...props}
			placeholder="YYYY-MM-DD hh:mm:ss"
			onBlur={handleBlur}
		/>
	)
}

export default DateTimeInput
