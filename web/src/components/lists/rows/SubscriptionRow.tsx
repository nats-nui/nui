import { RenderRowBaseProps } from "@/components/lists/List"
import { Subscription } from "@/types"
import { FunctionComponent } from "react"



const SubscriptionRow: FunctionComponent<RenderRowBaseProps<Subscription>> = ({
	item,
}) => {
	return (
		<div style={cssRoot}
		>{item.subject}</div>
	)
}

export default SubscriptionRow

const cssRoot:React.CSSProperties = {
	cursor: "pointer",
	fontSize: 14,
	fontWeight: 600,
	minHeight: 24,
	display: 'flex',
	alignItems: 'center',
	padding: "0px 3px",
}
