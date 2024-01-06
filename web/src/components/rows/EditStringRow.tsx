import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent, useState } from "react"
import TextInput from "../input/TextInput"
import { RenderRowBaseProps } from "../lists/EditList"
import Box from "../Box"



const EditStringRow: FunctionComponent<RenderRowBaseProps<string>> = ({
	item,
	focus,
	variant = 0,
	readOnly = false,
	onChange,
	onDelete,
	onFocus,
}) => {

	const handleChange = (newItem: string) => {
		onChange?.(newItem)
	}

	// ******************

	// HOOKS

	// HANDLER
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.key == "Delete" || event.key == "Backspace") && isVoid(item)) {
			event.preventDefault()
			onDelete?.()
		}
	}

	// ******************

	const handleDelete = () => onDelete?.()


	// RENDER
	return <Box
		style={cssRow}
		preRender={readOnly ? "\u2022 " : null}
		enterRender={!readOnly && <IconButton onClick={handleDelete}><CloseIcon /></IconButton>}
	>
		<TextInput
			style={{ flex: 1 }}
			value={item}
			variant={variant}
			readOnly={readOnly}
			focus={focus}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={onFocus}
		/>
	</Box>
}

export default EditStringRow

const isVoid = (item: string) => !item || item.trim().length == 0

const cssRow: React.CSSProperties = {
	minHeight: 24,
	display: "flex",
	alignItems: "center",
}
