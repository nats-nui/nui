import { RenderRowBaseProps } from "@/components/lists/generic/List"
import { FunctionComponent } from "react"



const StringRow: FunctionComponent<RenderRowBaseProps<string>> = ({
	item,
}) => {
	return (
		<div style={cssRoot}
		>{item.toString()}</div>
	)
}

export default StringRow

const cssRoot:React.CSSProperties = {
	cursor: "pointer",
	fontSize: 14,
	fontWeight: 600,
	minHeight: 24,
	display: 'flex',
	alignItems: 'center',
	padding: "0px 3px",
}
