import { FunctionComponent, useState } from "react"
import JsonValueCmp from "./JsonValueCmp"



interface Props {
	propName: string
	value: any
	deep: number
}

const JsonKeyValueCmp: FunctionComponent<Props> = ({
	propName: key,
	value,
	deep = 0,
}) => {

	// HOOKS
	const [collapsed, setCollapsed] = useState(false)
	const [mouseOver, setMouseOver] = useState(false)

	// HANDLER
	const handleKeyClick = () => setCollapsed(!collapsed)
	const handleEnter = () => setMouseOver(true)
	const handleLeave = () => setMouseOver(false)

	// RENDER
	return <>
		{!!key && (
			<span style={cssKey(collapsed)}
				onClick={handleKeyClick}
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
			>{key}: </span>
		)}

		<JsonValueCmp
			value={value}
			deep={deep}
			collapsed={collapsed}
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