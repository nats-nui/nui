import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent } from "react"
import Box from "../format/Box"
import TextInput from "../input/TextInput"
import { RenderRowBaseProps } from "../lists/EditList"



const EditStringRow: FunctionComponent<RenderRowBaseProps<string>> = ({
	item,
	isSelect,
	readOnly = false,
	placeholder,
	onChange,
	onSelect,
}) => {

	// HOOKS

	// HANDLER
	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if ((event.key == "Delete" || event.key == "Backspace") && isVoid(item)) {
			event.preventDefault()
			onChange?.(null)
		}
	}
	const handleChange = (newItem: string) => onChange?.(newItem)
	const handleDelete = () => onChange?.(null)

	// RENDER
	return <Box
		style={cssRow}
		enterRender={!readOnly && <IconButton onClick={handleDelete}><CloseIcon /></IconButton>}
	>
		<TextInput multiline
			style={{ flex: 1 }}
			value={item}
			placeholder={placeholder}
			readOnly={readOnly}
			focus={isSelect}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={onSelect}
		/>
	</Box>
}

export default EditStringRow

const isVoid = (item: string) => !item || item.trim().length == 0

const cssRow: React.CSSProperties = {
	//minHeight: 24,
	display: "flex",
	alignItems: "center",
}
