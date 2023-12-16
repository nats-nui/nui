import { FunctionComponent } from "react"
import JsonKeyValueCmp from "./JsonKeyValueCmp"



interface Props {
	json?: JSON
	style?: React.CSSProperties
}

const JsonCmp: FunctionComponent<Props> = ({
	json,
	style,
}) => {
	return (
		<div style={{ ...cssBody, ...style }}>
			{JsonPropsCmp({ json, deep: 0 })}
		</div>
	)
}

export default JsonCmp

const cssBody: React.CSSProperties = {
	fontFamily: "monospace",
	overflowWrap: "break-word",
	wordBreak: "break-all",
}



interface ObjPros {
	json: any,
	deep?: number,
	style?: React.CSSProperties,
}

const isPrimitive = (value: any) => ["string", "number", "bigint", "boolean", "symbol", "undefined"].includes(typeof value)

export const JsonPropsCmp: FunctionComponent<ObjPros> = ({
	json,
	deep = 0,
	style,
}) => {

	const isArray = Array.isArray(json)
	const entries = Object.entries(json)
	const keysLength = entries.length
	const horiz = keysLength == 0
		|| (isArray && entries.every(([key, value]) => isPrimitive(value)))
		|| (keysLength == 2 && !!json.key)

	return <div style={{ ...cssList(deep, horiz), ...style }}>

		{entries.map(([key, value], index) => (
			// KEY : VALUE
			<div key={key} style={cssRow(deep, horiz)}>
				<JsonKeyValueCmp propName={isArray ? null : key} value={value} deep={deep} />
				{index < keysLength - 1 && <span>, </span>}
			</div>

		))}

	</div>
}


const cssList = (deep: number, horiz: boolean): React.CSSProperties => ({
	fontSize: [12, 12, 12, 12, 12, 12, 12][deep],
	fontWeight: [900, 200, 200, 100,][deep],
	//opacity: deep == 0 ? 1 : 0.95,
	marginLeft: horiz ? null : deep * 5,
	display: !horiz ? "block" : "inline",
})

const cssRow = (deep: number, horiz: boolean): React.CSSProperties => ({
	display: !horiz ? "block" : "inline",
	// marginTop: deep == 0 ? 5 : null,
	// marginBottom: deep == 0 ? 5 : null,
})