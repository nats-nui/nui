import CloseIcon from "@/icons/CloseIcon"
import FindIcon from "@/icons/FindIcon"
import React, { FunctionComponent } from "react"
import IconButton from "../buttons/IconButton"
import cls from "./FindInputHeader.module.css"
import TextInput from "./TextInput"



interface Props {
	value?: string
	onChange?: (newValue: string) => void
	style?: React.CSSProperties
}

const FindInputHeader: FunctionComponent<Props> = ({
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
		<div
			className={`${cls.root} ${haveValue ? "color-br" : ""}`}
			style={style}
		>
			<TextInput
				placeholder="search..."
				className={cls.input}
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

export default FindInputHeader