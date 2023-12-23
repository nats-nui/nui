import { FunctionComponent, useState } from "react"
import JsonValueCmp from "./JsonValueCmp"
import { getInitCollapsed } from "./utils"

enum COLLAPSE_TYPE {
	NULL,
	SHOW,
	HIDE,
	SHOW_RECURSIVE,
	HIDE_RECURSIVE,
}

interface Props {
	propName: string
	value: any
	deep: number
	recursive?: boolean
}

const JsonKeyValueCmp: FunctionComponent<Props> = ({
	propName: key,
	value,
	deep = 0,
	recursive,
}) => {

	// HOOKS
	const [collapsed, setCollapsed] = useState(getInitCollapsed(value))
	const [mouseOver, setMouseOver] = useState(false)

	// HANDLER
	const handleKeyClick = (e:React.MouseEvent<HTMLSpanElement>) => {
		setCollapsed(!collapsed)
	}
	const handleEnter = () => setMouseOver(true)
	const handleLeave = () => setMouseOver(false)

	// RENDER
	return <>
		<span style={cssKey(collapsed)}
			onClick={handleKeyClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>{key}: </span>

		<JsonValueCmp
			value={value}
			deep={deep}
			collapsed={collapsed}
			recursive={recursive}
			style={mouseOver ? cssHighlight : {}}
		/>
	</>
}

export default JsonKeyValueCmp

const cssKey = (collapsed: boolean): React.CSSProperties => ({
	cursor: "pointer",
	backgroundColor: collapsed && "rgb(0 0 0 / 60%)",
})

const cssHighlight: React.CSSProperties = {
	backgroundColor: "rgb(0 0 0 / 20%)",
	//border: "1px solid black",
	//paddingLeft: 5,
}