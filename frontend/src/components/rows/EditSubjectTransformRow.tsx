import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent } from "react"
import { Box, IconButton, TextInput } from "@priolo/jack"
import { RenderRowBaseProps } from "@priolo/jack"
import { SubjectTransform } from "@/types/Stream.ts";



const EditSubjectTransformRow: FunctionComponent<RenderRowBaseProps<SubjectTransform>> = ({
	item,
	isSelect,
	readOnly = false,
	placeholder,
	onChange,
	onSelect,
}) => {


	const handleSourceChange = (value: string) => {
		onChange({ src: value, dest: item?.dest ?? "" })
	}
	const handleDestChange = (value: string) => {
		onChange({ src: item?.src ?? "", dest: value })
	}
	const handleDelete = () => onChange?.(null)

	return (
		<Box style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 1, marginBottom: 8, paddingLeft: 5, borderLeft: "2px solid rgba(0, 0, 0, 0.2)"}}
			enterRender={!readOnly && <IconButton onClick={handleDelete}><CloseIcon /></IconButton>}
		>
			<div style={{ display: "flex", gap: 2, alignItems: "center" }}>
				<TextInput style={{width: "100%"}} autoFocus multiline
					placeholder="SOURCE"
					value={item?.src}
					onChange={handleSourceChange}
					readOnly={readOnly}
				/>
			</div>
			<div style={{ display: "flex", gap: 2, alignItems: "center" }}>
				<TextInput style={{width: "100%"}} multiline
					placeholder="DESTINATION"
					value={item?.dest}
					onChange={handleDestChange}
					readOnly={readOnly}
				/>
			</div>
		</Box>
	)
}

export default EditSubjectTransformRow