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
	return <>
		{!!label && <div style={cssLabel}>{label}</div>}
		<div style={{ ...cssLine, ...style }} />
	</>
}

export default Divider

const cssLabel: React.CSSProperties = {
	fontSize: 8,
	textAlign: 'right',
	marginTop: 10,
	opacity: .8,
}

const cssLine: React.CSSProperties = {
	borderTop: `1px solid rgb(0 0 0 / .2)`,
	borderTopStyle: 'dashed'
}
