import { FunctionComponent, useEffect, useState } from "react"
import JsonValueCmp from "./JsonValueCmp"
import { COLLAPSE_TYPE, getInitCollapsed, inShow } from "./utils"
import layoutSo, { COLOR_VAR } from "@/stores/layout"



interface Props {
	propName: string
	value: any
	deep: number
	collapsed?: COLLAPSE_TYPE
}

const JsonKeyValueCmp: FunctionComponent<Props> = ({
	propName: key,
	value,
	deep = 0,
	collapsed,
}) => {

	// HOOKS
	const [collapsedInt, setCollapsedInt] = useState<COLLAPSE_TYPE>(getInitCollapsed(value))
	const [mouseOver, setMouseOver] = useState(false)
	useEffect(()=>{
		if ( collapsed == COLLAPSE_TYPE.HIDE_RECURSIVE ) setCollapsedInt(COLLAPSE_TYPE.HIDE_RECURSIVE)
		else if ( collapsed == COLLAPSE_TYPE.SHOW_RECURSIVE ) setCollapsedInt(COLLAPSE_TYPE.SHOW_RECURSIVE)
	},[collapsed])

	// HANDLER
	const handleKeyClick = (e: React.MouseEvent<HTMLSpanElement>) => {
		if (e.shiftKey) {
			setCollapsedInt(inShow(collapsedInt) ? COLLAPSE_TYPE.HIDE_RECURSIVE : COLLAPSE_TYPE.SHOW_RECURSIVE)
		} else {
			setCollapsedInt(inShow(collapsedInt) ? COLLAPSE_TYPE.HIDE : COLLAPSE_TYPE.SHOW)
		}
	}
	const handleEnter = () => setMouseOver(true)
	const handleLeave = () => setMouseOver(false)

	// RENDER
	const show = inShow(collapsedInt)

	return <>
		<span style={cssKey(show)}
			onClick={handleKeyClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>{!show && ">"}{key}: </span>

		<JsonValueCmp
			value={value}
			deep={deep}
			collapsed={collapsedInt}
			style={mouseOver ? cssHighlight : {}}
		/>
	</>
}

export default JsonKeyValueCmp

const cssKey = (inShow: boolean): React.CSSProperties => ({
	cursor: "pointer",
	backgroundColor: !inShow && "rgb(0 0 0 / 60%)",
	color: !inShow && layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,
})

const cssHighlight: React.CSSProperties = {
	backgroundColor: "rgb(0 0 0 / 20%)",
	//border: "1px solid black",
	//paddingLeft: 5,
}