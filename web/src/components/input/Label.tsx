import React, { FunctionComponent } from "react"

export enum LABELS {
	TEXT = 0,
	READ,
	SUB_TITLE,
	TITLE,
	TITLE_DIALOG,
}

interface Props {
	type?: number
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
	style?: React.CSSProperties

}

const Label: FunctionComponent<Props> = ({
	type = LABELS.TEXT,
	onClick,
	children,
	style,
}) => {

	// STORE

	// HOOK

	// HANDLER

	// RENDER
	if (children == null) return null
	const css = {
		cursor: !!onClick ? "pointer" : null,
		...cssRoot,
		...[cssNormal, cssReadOnly, cssSubTitle, cssTitle, cssTitleDialog][type] ?? cssNormal,
		...style
	}
	return <div
		onClick={onClick}
		style={css}
	>
		{children}
	</div>
}

export default Label

/** label titolo per una proprietà */
const cssNormal: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 800,
	marginTop: 5,
	whiteSpace: "nowrap",
}
/** label di un input readonly */
const cssReadOnly: React.CSSProperties = {
	//color: layoutSo.state.theme.palette.default.bg,
	fontSize: 12,
	fontWeight: 600,
	padding: 3,
}
const cssSubTitle: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	opacity: .7,
}
const cssTitle: React.CSSProperties = {
	fontSize: 22,
	lineHeight: "23px",
	fontWeight: 800,
	fontFamily: "Darker Grotesque",
	whiteSpace: "nowrap",
}
const cssTitleDialog: React.CSSProperties = {
	fontSize: 20,
	lineHeight: "23px",
	fontWeight: 800,
	fontFamily: "Darker Grotesque",
	marginBottom: 15,
}

const cssRoot: React.CSSProperties = {
	// ATTENZIONE SE METTO QUESTI NON MI FA IL TRUNCATE
	//display: "flex",
	//alignItems: "center",
	
	//overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
}
