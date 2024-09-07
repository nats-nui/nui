import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent } from "react"
import { Box, IconButton, TextInput } from "@priolo/jack"
import { RenderRowBaseProps } from "@priolo/jack"
import {SubjectTransform} from "@/types/Stream.ts";



const EditSubjectTransformRow: FunctionComponent<RenderRowBaseProps<SubjectTransform>> = ({
	item,
	isSelect,
	readOnly = false,
	placeholder,
	onChange,
	onSelect,
}) => {


	const handleSourceChange = (value: string) => {
		onChange({src: value, dest: item?.dest ?? ""})
	}
	const handleDestChange = (value: string) => {
		onChange({src: item?.src ?? "", dest: value})
	}
	const handleDelete = () => onChange?.(null)

	return <Box style={{display: "flex", alignItems: "center", margin: "3px 0px"}}
				enterRender={!readOnly &&
					<IconButton onClick={handleDelete}>
						<CloseIcon/>
					</IconButton>}
	>
		<div className="jack-lyt-quote">
			<div className="lyt-v">
				<div className="jack-lbl-prop">SOURCE</div>
				<TextInput
					value={item?.src}
					onChange={handleSourceChange}
					readOnly={readOnly}
				/>
			</div>
			<div className="lyt-v">
				<div className="jack-lbl-prop">DESTINATION</div>
				<TextInput
					value={item?.dest}
					onChange={handleDestChange}
					readOnly={readOnly}
				/>
			</div>
		</div>
	</Box>
}

export default EditSubjectTransformRow