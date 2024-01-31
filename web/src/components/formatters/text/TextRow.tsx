import { FunctionComponent } from "react"



interface Props {
	text?: string
	error?: boolean
}

const TextRow: FunctionComponent<Props> = ({
	text,
	error,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if ( !text ) return null
	// accorcio la stringa se è troppo lunga
	const render = text.length > 200 
		? <>{text.substring(0, 200)}{'\u2026'}<span style={cssInfo}>{text.length}</span></> 
		: text

	return (
		<div style={cssBody(error)}>
			{render}
		</div>
	)
}

export default TextRow

const cssBody = (error:boolean): React.CSSProperties => ({
	fontFamily: "monospace",
	fontSize: 14,
	overflowWrap: "break-word",
	wordBreak: "break-all",
	color: error ? "yellow" : null,
})

const cssInfo = {
	opacity: .5,
}
