import layoutSo from "@/stores/layout"
import React, { FunctionComponent, useEffect, useMemo, useRef } from "react"
import Label, { LABEL_TYPES } from "./Label"
import dayjs from "dayjs"



interface Props {
	value?: any
	readOnly?: boolean
	variant?: number
	style?: React.CSSProperties
	focus?: boolean

	onChange?: (newValue: string) => void
	onFocus?: () => void
}

const DateTimeInput: FunctionComponent<Props> = ({
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
	useEffect(() => {
		if (!focus) return
		inputRef.current?.select()
	}, [focus])

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;
		value = value.replace(/\D/g, '');
		onChange?.(value)
	}

	// RENDER

	// Rimuovi tutti i caratteri non numerici e aggiungi i separatori di data e ora
	//value = value.replace(/\D/g, '');
	const valueShow = useMemo(() => {
		let valueShow = ""
		for (let i = 0; i < value.length; i++) {
			const char = value[i]
			valueShow += ["-","-"," ",":",":"][[4, 6, 8, 10, 12].indexOf(i)] ?? ""
			valueShow += char
		}
		return valueShow
	}, [value])


	return (!readOnly ? (
		<input ref={inputRef}
			type="text"
			placeholder="YYYY-MM-DD hh:mm:ss"


			style={{ ...cssRoot, ...style }}
			className={`var${variant}`}
			value={valueShow}
			onChange={handleChange}
			onFocus={onFocus}
		/>
	) : (
		<Label type={LABEL_TYPES.TEXT}>{value}</Label>
	))
}

export default DateTimeInput

const cssRoot: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
	padding: '5px 7px',
	//minHeight: '16px',
}
