import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent } from "react"
import Box from "../format/Box"
import { RenderRowBaseProps } from "../lists/EditList"
import ListRow from "../lists/ListRow"



const EditItemRow: FunctionComponent<RenderRowBaseProps<any>> = ({
	item,
	isSelect,
	readOnly = false,
	onChange,
	onSelect,
}) => {

	// HOOKS

	// HANDLER
	const handleDelete = () => onChange?.(null)

	// RENDER
	return <Box
		style={cssRow}
		enterRender={!readOnly && 
			<IconButton onClick={handleDelete} >
				<CloseIcon />
			</IconButton>}
	>
		<ListRow style={{ flex: 1, padding: '3px 5px' }} onClick={onSelect} isSelect={isSelect}>
			{item ?? ""}
		</ListRow>
	</Box>
}

export default EditItemRow

const cssRow: React.CSSProperties = {
	//minHeight: 22,
	display: "flex",
	alignItems: 'stretch',
}
