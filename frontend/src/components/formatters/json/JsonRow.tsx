import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { FunctionComponent, useMemo } from "react"
import TextRow from "../text/TextRow"
import { toJson } from "@/utils/editor"

const limLength = [8, 3, 2]
const limitDeept = 2
const limitArray = 2

interface Props {
	text?: string
}

const JsonRow: FunctionComponent<Props> = ({
	text,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	const  {json, success} = useMemo(()=> toJson(text), [text])
	if ( !success ) return <TextRow text={text} error/>

	return (
		<div style={cssBody}>
			<FormatObj json={json} deep={0} />
		</div>
	)
}

export default JsonRow

const cssBody: React.CSSProperties = {
	fontSize: 12,
	overflowWrap: "break-word",
	fontFamily: "monospace",
}

interface ObjPros {
	json: any,
	deep?: number,
}
const FormatObj: FunctionComponent<ObjPros> = ({ json, deep = 0 }) => {

	if (deep > limitDeept) return "\u2026"
	if (!json) return null

	const ret = []
	let index = 0
	const isArray = Array.isArray(json)
	let keys = Object.keys(json);

	let lastIndex = keys.length - 1;
	const limit = limLength[deep]

	if (isArray && keys.length > limitArray) {
		ret.push(<span style={cssArrayInfo}>{`\u2026${keys.length}`}</span>)

	} else if (deep > 2) {
		ret.push("\u2026")

	} else {
		for (let key in json) {

			if (index >= limit) {
				ret.push(<span>{"\u2026"}</span>)
				break
			}
			let value = json[key]
			const type = typeof value


			// KEY
			if (!isArray) ret.push(<span>{key}:</span>)


			// VALUE
			if (value == null) {
				ret.push(<span style={cssNull}>null, </span>)
			} else if (type === "object") {
				ret.push(FormatObj({ json: value, deep: deep + 1 }))

			} else if (type === "string") {
				if (value.length > 8) value = `${value.substring(0, 8)}\u2026`
				ret.push(<span style={cssString}>"{value}"</span>)

			} else if (type === "number") {
				value = value.toString()
				ret.push(<span style={cssNumber}>{value}</span>)

			} else if (type === "boolean") {
				value = value ? "\u2714" : "\u2716"
				ret.push(json[key] 
					? <span style={cssTrue}>&#x2714;, </span> 
					: <span style={cssFalse}>&#x2716;</span>
				)
			}

			if (index < lastIndex) ret.push(<span>, </span>)
			index++
		}
	}


	return (
		<span style={{ wordBreak: "break-all" }}>
			<span style={cssBrackets(deep)}>{isArray ? "[" : "{"}</span>
			{ret}
			<span style={cssBrackets(deep)}>{isArray ? "]" : "}"}</span>
		</span>
	)
}


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