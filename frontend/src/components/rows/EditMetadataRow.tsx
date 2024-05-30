import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent } from "react"
import Box from "../format/Box"
import TextInput from "../input/TextInput"
import { RenderRowBaseProps } from "../lists/EditList"



const EditMetadataRow: FunctionComponent<RenderRowBaseProps<[string, string]>> = ({
	item,
	isSelect,
	readOnly = false,
	placeholder,
	onChange,
	onSelect,
}) => {


	const handleKeyChange = (key: string) => {
		onChange([key, item?.[1] ?? ""])
	}
	const handleValueChange = (value: string) => {
		onChange([item?.[0] ?? "", value])
	}
	const handleDelete = () => onChange?.(null)

	return <Box style={{ display: "flex", alignItems: "center", margin: "3px 0px" }}
		enterRender={!readOnly &&
			<IconButton onClick={handleDelete} >
				<CloseIcon />
			</IconButton>}
	>
		<TextInput style={{ flex: 1 }}
			focus={isSelect}
			value={item?.[0] ?? ""}
			onChange={handleKeyChange}
		/>
		<div>:</div>
		<TextInput style={{ flex: 3 }}
			value={item?.[1] ?? ""}
			onChange={handleValueChange}
		/>
	</Box>
}

export default EditMetadataRow