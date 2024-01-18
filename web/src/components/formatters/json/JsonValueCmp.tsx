import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { FunctionComponent } from "react"
import { JsonPropsCmp } from "./JsonCmp"
import { COLLAPSE_TYPE, getBrackets, inShow, maxStringLength } from "./utils"



interface Props {
	value: any,
	collapsed?: COLLAPSE_TYPE
	deep?: number
	style?: React.CSSProperties
}

const JsonValueCmp: FunctionComponent<Props> = ({
	value,
	collapsed,
	deep = 0,
	style = {},
}) => {


	// RENDER
	const type = typeof value

	if (value == null) {
		return <span style={{ ...cssNull, ...style }}>null</span>

	} else if (type === "object") {
		const styBrackets = { ...cssBrackets(deep), ...style }
		const brc = getBrackets(value)
		return <>
			<span style={styBrackets}>{brc[0]}</span>
			{!inShow(collapsed) && <span style={cssArrayInfo}>{`\u2026${value.length ?? ""}`}</span>}
			<JsonPropsCmp json={value} deep={deep + 1} style={style} collapsed={collapsed} />
			<span style={styBrackets}>{brc[1]}</span>
		</>

	} else if (type === "string") {
		if (!inShow(collapsed)) value = `${value.substring(0, maxStringLength)}\u2026`
		return <span style={{ ...cssString, ...style }}>"{value}"</span>

	} else if (type === "number") {
		value = value.toString()
		return <span style={{ ...cssNumber, ...style }}>{value}</span>

	} else if (type === "boolean") {
		return !!value
			? <span style={{ ...cssTrue, ...style }}>&#x2714;</span>
			: <span style={{ ...cssFalse, ...style }}>&#x2716;</span>
	}

}

export default JsonValueCmp

const cssNull = {
	color: layoutSo.state.theme.palette.var[COLOR_VAR.FUCHSIA].bg,
}
const cssString = {
	color: layoutSo.state.theme.palette.var[COLOR_VAR.GREEN].bg,
}
const cssNumber = {
	color: layoutSo.state.theme.palette.var[COLOR_VAR.CYAN].bg,
}
const cssTrue = {
	color: layoutSo.state.theme.palette.var[COLOR_VAR.GREEN].bg,
}
const cssFalse = {
	color: layoutSo.state.theme.palette.var[COLOR_VAR.FUCHSIA].bg,
}
const cssArrayInfo = {
	opacity: .5
}
const cssBrackets = (deep: number): React.CSSProperties => {
	const colors = layoutSo.state.theme.palette.var
	return {
		color: [
			null,
			colors[COLOR_VAR.CYAN].bg,
			colors[COLOR_VAR.FUCHSIA].bg,
			colors[COLOR_VAR.YELLOW].bg
		][deep % 4]
	}
}