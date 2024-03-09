import { FunctionComponent } from "react"



interface Props {
	label?: string
	style?: React.CSSProperties
}
/**
 * DA ELIMINARE A FAVORE DEL DIV CON CLASSE APPPROPPRIATA
 */
const Divider: FunctionComponent<Props> = ({
	label,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return <div style={cssRoot}>
		{!!label && <div style={cssLabel}>{label}</div>}
		{/* <div style={{ ...cssLine, ...style }} /> */}
	</div>
}

export default Divider

const cssRoot: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}

const cssLabel: React.CSSProperties = {
	// fontSize: 9,
	// textAlign: 'right',
	// opacity: .8,

	fontSize: '11px',
	borderBottom: '1px solid rgb(0 0 0 / 32%)',
	borderTop: '1px solid rgb(0 0 0 / 32%)',
	padding: '3px',
	textAlign: 'center',
	fontWeight: '600'
}

const cssLine: React.CSSProperties = {
	borderTop: `1px solid rgb(0 0 0 / .2)`,
	borderTopStyle: 'dashed'
}
