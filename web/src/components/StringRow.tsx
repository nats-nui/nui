import { RenderRowBaseProps } from "@/components/stacks/dialogs/ListEditDlg"
import { FunctionComponent } from "react"



const StringRow: FunctionComponent<RenderRowBaseProps<string>> = ({
	item,
}) => {
	return (
		<div>{item.toString()}</div>
	)
}

export default StringRow
