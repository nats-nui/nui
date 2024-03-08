import { FunctionComponent } from "react"
import JsonKeyValueCmp from "./JsonKeyValueCmp"
import { COLLAPSE_TYPE, inShow, isPrimitive } from "./utils"
import TextCmp from "../text/TextCmp"
import { toJson } from "@/utils/editor"



interface Props {
	text?: string
	style?: React.CSSProperties
}

const JsonCmp: FunctionComponent<Props> = ({
	text,
	style,
}) => {

	// RENDER
	const { json, success } = toJson(text)
	if (!success) return <TextCmp text={text} />

	return (
		<div style={{ ...cssBody, ...style }}>
			<JsonPropsCmp json={json} deep={0} />
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
	json: any
	deep?: number
	collapsed?: COLLAPSE_TYPE
	style?: React.CSSProperties
}

export const JsonPropsCmp: FunctionComponent<ObjPros> = ({
	json,
	deep = 0,
	collapsed,
	style,
}) => {

	const isArray = Array.isArray(json)
	const entries = Object.entries(json)
	const keysLength = entries.length
	const horiz = keysLength == 0
		|| (isArray && entries.every(([key, value]) => isPrimitive(value)))
		|| (keysLength == 2 && !!json.key)

	return <div style={{ ...cssList(deep, horiz, inShow(collapsed)), ...style }}>

		{entries.map(([key, value], index) => (
			// KEY : VALUE
			<div key={key} style={cssRow(deep, horiz)}>
				<JsonKeyValueCmp
					propName={key}
					value={value}
					deep={deep}
					collapsed={collapsed}
				/>
				{index < keysLength - 1 && <span>, </span>}
			</div>

		))}

	</div>
}


const cssList = (deep: number, horiz: boolean, inShow: boolean): React.CSSProperties => ({
	fontSize: [12, 12, 12, 12, 12, 12, 12][deep],
	fontWeight: [900, 200, 200, 100,][deep],
	//opacity: deep == 0 ? 1 : 0.95,
	marginLeft: horiz ? null : deep * 5,
	display: !inShow ? "none" : !horiz ? "block" : "inline",
})

const cssRow = (deep: number, horiz: boolean): React.CSSProperties => ({
	display: !horiz ? "block" : "inline",
	// marginTop: deep == 0 ? 5 : null,
	// marginBottom: deep == 0 ? 5 : null,
})