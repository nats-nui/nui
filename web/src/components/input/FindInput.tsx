import FindIcon from "@/icons/FindIcon"
import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"
import TextInput from "./TextInput"



interface Props {
	value?: string
	onChange?: (newValue: string) => void
	variant?:number
	style?: React.CSSProperties
}

const FindInput: FunctionComponent<Props> = ({
	value,
	onChange,
	variant,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleChange = (value:string) => onChange?.(value)

	// RENDER
	return (
		<div style={{...cssRoot, ...style}}>
			
			<TextInput style={cssInput}
				value={value}
				onChange={handleChange}
				variant={variant}
			/>
			<FindIcon />
		</div>
	)
}

export default FindInput

const cssRoot: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	display: "flex",
	alignItems: "center",
	padding: '5px 7px',
}
const cssInput: React.CSSProperties = {
	flex: 1,
	padding: 0,
	color: layoutSo.state.theme.palette.default.fg,
	border: 'none',
	width: "100%",
}
