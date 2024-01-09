import { RenderRowBaseProps } from "@/components/lists/List"
import { FunctionComponent } from "react"
import Label, { LABELS } from "../input/Label"



const StringRow: FunctionComponent<RenderRowBaseProps<string>> = ({
	item,
}) => {
	return (
		<Label type={LABELS.READ} style={cssRoot}>
			{item.toString()}
		</Label>
	)
}

export default StringRow

const cssRoot: React.CSSProperties = {
	cursor: "pointer",
	display: 'flex',
	alignItems: 'center',
}
