import layoutSo from "@/stores/layout"
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
import Label, { LABELS } from "./Label"
import dayjs from "dayjs"



interface Props {
	value?: any
	readOnly?: boolean
	variant?: number
	style?: React.CSSProperties
	focus?: boolean

	onChange?: (value: any) => void
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
	const [valueTmp, setValueTmp] = useState(() => {
		const v = dayjs(value)
		if (v.isValid()) return v.format("YYYYMMDDhhmmss")
		return ""
	})
	const inputRef = useRef<HTMLInputElement>(null)
	useEffect(() => {
		if (!focus) return
		inputRef.current?.select()
	}, [focus])

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;
		setValueTmp(value.replace(/\D/g, ''))
		const data = dayjs(value).valueOf()
		onChange?.(data)
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

	if (readOnly) return <Label type={LABELS.READ}>{valueShow}</Label>

	return (
		<input ref={inputRef}
			type="text"
			placeholder="YYYY-MM-DD hh:mm:ss"
			style={{ ...cssRoot, ...style }}
			className={`var${variant}`}
			value={valueShow}
			onChange={handleChange}
			onFocus={onFocus}
		/>
	)
}

export default DateTimeInput

const cssRoot: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
	padding: '5px 7px',
	flex: 1,
}
