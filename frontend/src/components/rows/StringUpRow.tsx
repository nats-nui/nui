import { FunctionComponent } from "react"
import { RenderRowBaseProps } from "../lists/EditList"



const StringUpRow: FunctionComponent<RenderRowBaseProps<any>> = ({
	item,
	isSelect,
}) => <div className="list-row">{item?.toUpperCase() ?? ""}</div>

export default StringUpRow
