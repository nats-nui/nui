import FindIcon from "@/icons/FindIcon"
import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"
import TextInput from "./TextInput"
import IconButton from "../buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"



interface Props {
	value?: string
	onChange?: (newValue: string) => void
	style?: React.CSSProperties
}

const FindInput: FunctionComponent<Props> = ({
	value,
	onChange,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleChange = (value: string) => onChange?.(value)
	const handleClear = () => onChange?.("")

	// RENDER
	const haveValue = value?.length > 0

	return (
		<div style={{ ...cssRoot, ...style }}>
			<TextInput style={cssInput}
				value={value}
				onChange={handleChange}
			/>
			{haveValue ? (
				<IconButton
					onClick={handleClear}
				>
					<CloseIcon />
				</IconButton>
			) : (
				<FindIcon />
			)}
		</div>
	)
}

export default FindInput

const cssRoot: React.CSSProperties = {
	flex: 1,
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	display: "flex",
	alignItems: "center",
	padding: '5px 7px',
	minHeight: 18,
}
const cssInput: React.CSSProperties = {
	flex: 1,
	padding: 0,
	border: 'none',
	width: "100%",
}
