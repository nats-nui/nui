import Button from "@/components/buttons/Button"
import IconButton from "@/components/buttons/IconButton"
import Label from "@/components/input/Label"
import CloseIcon from "@/icons/CloseIcon"
import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent } from "react"
import Box from "../Box"
import TextInput from "../input/TextInput"
import { RenderRowBaseProps } from "../lists/EditList"



const EditAuthRow: FunctionComponent<RenderRowBaseProps<Auth>> = ({
	item,
	focus,
	readOnly,
	variant,
	onChange,
	onDelete,
	onFocus,
}) => {

	// ******************

	// HOOKS

	// HANDLER
	const handleDelete = () => onDelete?.()
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.key == "Delete" || event.key == "Backspace") && isVoid(item)) {
			event.preventDefault()
			onDelete?.()
		}
	}

	// ******************

	const handleFileMode = () => {
		onChange({ mode: AUTH_MODE.CREDS_FILE, creds: "" })
	}
	const handleNoneMode = () => {
		onChange({ mode: AUTH_MODE.NONE })
	}
	const handleChange = (newValue: string) => {
		onChange?.({ ...item, creds: newValue })
	}

	// RENDER
	return <Box
		style={cssRow}
		enterRender={!readOnly && <IconButton onClick={handleDelete}><CloseIcon /></IconButton>}
	>
		{item == null ? (
			<div style={{ display: "flex", flex: 1, alignItems: "center", minHeight: 24 }}>
				<Button label="NONE" onClick={handleNoneMode} />
				<Button label="FILE" onClick={handleFileMode} />
				<Button label="PSW" disabled />
				<Button label="JWT" disabled />
			</div>

		) : item.mode == AUTH_MODE.CREDS_FILE ? (
			<TextInput
				style={{ flex: 1 }}
				placeholder="path of creds file"
				focus={focus}
				readOnly={readOnly}
				value={item.creds}
				variant={variant}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onFocus={onFocus}
			/>

		) : (
			<Label>NONE</Label>
		)}

	</Box>

}

export default EditAuthRow

const isVoid = (item: Auth) => !item || (item.mode == AUTH_MODE.CREDS_FILE && !(item.creds?.length > 0))

const cssRow: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
}