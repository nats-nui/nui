import { FunctionComponent } from "react"



interface Props {
	label?: string
	style?: React.CSSProperties
}

const Divider: FunctionComponent<Props> = ({
	label,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return <div style={{ display: "flex", flexDirection: "column"}}>
		{!!label && <div style={cssLabel}>{label}</div>}
		<div style={{ ...cssLine, ...style }} />
	</div>
}

export default Divider

const cssLabel: React.CSSProperties = {
	fontSize: 9,
	textAlign: 'right',
	//marginTop: 10,
	opacity: .8,
}

const cssLine: React.CSSProperties = {
	borderTop: `1px solid rgb(0 0 0 / .2)`,
	borderTopStyle: 'dashed'
}
