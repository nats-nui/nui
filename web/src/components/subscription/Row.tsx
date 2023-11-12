import { Subscription } from "@/types"
import { FunctionComponent } from "react"
import { RenderRowBaseProps } from "../stacks/dialogs/ListEditDlg"



const SubRow: FunctionComponent<RenderRowBaseProps<Subscription>> = ({
	item,
}) => {
	return (
		<div>{item.subject}</div>
	)
}

export default SubRow
