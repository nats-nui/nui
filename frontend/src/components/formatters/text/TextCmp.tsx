import { FunctionComponent } from "react"



interface Props {
	text?: string
}

const TextCmp: FunctionComponent<Props> = ({
	text,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if ( !text ) return null

	return (
		<div style={cssBody}>
			{text}
		</div>
	)
}

export default TextCmp

const cssBody: React.CSSProperties = {
	fontFamily: "monospace",
	fontSize: 14,
	overflowWrap: "break-word",
}
