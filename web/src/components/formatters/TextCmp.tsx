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
	return (
		<div style={cssBody}>
			{text}
		</div>
	)
}

export default TextCmp

const cssBody: React.CSSProperties = {
	fontSize: 14,
	overflowWrap: "break-word",
}
