import { FunctionComponent } from "react"



interface Props {
	json?: JSON
}

const JsonCompactCmp: FunctionComponent<Props> = ({
	json,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER


	return (
		<div style={cssBody}>
			{FormatObj({ json, deep: 0 })}
		</div>
	)
}

export default JsonCompactCmp

const cssBody: React.CSSProperties = {
	fontSize: 14,
	overflowWrap: "break-word",
}

interface ObjPros {
	json: any,
	deep?: number,
}
const FormatObj: FunctionComponent<ObjPros> = ({ json, deep = 0 }) => {

	// limite di profondità
	//if (deep > 1) return "\u2026"
	if ( !json ) return null

	const ret = []
	let index = 0
	const isArray = Array.isArray(json)
	let keys = Object.keys(json);
	let lastIndex = keys.length - 1;
	const limit = [8,3,2][deep]


	for (let key in json) {

		if (index >= limit) {
			ret.push(<span>{"\u2026"}</span>)
			break
		}

		let value = json[key]
		const type = typeof value

		if (!isArray) {
			ret.push(<span>{key}: </span>)
		}


		if (value == null) {
			ret.push(<span style={cssNull}>null, </span>)
		} else if (type === "object") {
			if (deep > 2) {
				ret.push("\u2026")
			} else {
				ret.push(FormatObj({ json: value, deep: deep + 1 }))
			}
		} else if (type === "string") {
			if (value.length > 8) value = `${value.substring(0, 8)}\u2026`
			ret.push(<span style={cssString}>"{value}"</span>)
		} else if (type === "number") {
			value = value.toString()
			ret.push(<span style={cssNumber}>{value}</span>)
		} else if (type === "boolean") {
			value = value ? "\u2714" : "\u2716"
			ret.push(json[key] ? <span style={cssTrue}>&#x2714;, </span> : <span style={cssFalse}>&#x2716;</span>)
		}
		if ( index< lastIndex ) ret.push(<span>, </span>)
		index++
	}

	return <span
		style={{
			backgroundColor: ["transparent", "#004545", "#1e1e1e", "#7b7b7b"][deep],
			//opacity: [1, 1, 0.9, 0.8][deep],
			fontSize: [14, 12, 10, 8][deep],
			wordBreak: "break-all"
		}}
	><span
		style={{ color: [null, "#10f3f3", "#f310ea", "#bbfb35"][deep] }}
	>{isArray ? "[" : "{"}</span>{ret}<span style={{ color: [null, "#10f3f3", "#f310ea", "#bbfb35"][deep] }}>{isArray ? "]" : "}"}</span></span>
}


const cssNull = {
	color: "red"
}
const cssString = {
	color: "#bbfb35"
}
const cssNumber = {
	color: "#10f3f3"
}
const cssTrue = {
	color: "green"
}
const cssFalse = {
	color: "red"
}