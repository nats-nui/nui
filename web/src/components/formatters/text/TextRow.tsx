import { FunctionComponent } from "react"



interface Props {
	text?: string
}

const TextRow: FunctionComponent<Props> = ({
	text,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if ( !text ) return null
	const render = text.length > 200 
		? <>{text.substring(0, 200)}{'\u2026'}<span style={cssInfo}>{text.length}</span></> 
		: text

	return (
		<div style={cssBody}>
			{render}
		</div>
	)
}

export default TextRow

const cssBody: React.CSSProperties = {
	fontFamily: "monospace",
	fontSize: 14,
	overflowWrap: "break-word",
	wordBreak: "break-all",
}

const cssInfo = {
	opacity: .5,
}
