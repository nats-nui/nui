import { Subscription } from "@/types"
import { FunctionComponent } from "react"
import { RenderRowBaseProps } from "../lists/List"



const SubRow: FunctionComponent<RenderRowBaseProps<Subscription>> = ({
	item,
}) => {
	return (
		<div>{item.subject}</div>
	)
}

export default SubRow
