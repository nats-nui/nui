import React, { FunctionComponent } from "react"



export enum LABELS {
	TEXT = 0,
	READ,
	SUBTEXT,
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
		...[cssText, cssReadOnly, cssSubText, cssSubTitle, cssTitle, cssTitleDialog][type] ?? cssText,
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
const cssText: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 800,
	//margin: "10px 0px 0px 0px",
	whiteSpace: "nowrap",
	flex: 1,
}

/** label di un input readonly */
const cssReadOnly: React.CSSProperties = {
	//color: layoutSo.state.theme.palette.default.bg,
	fontSize: 12,
	fontWeight: 600,
	padding: "4px 3px",
}
const cssSubText: React.CSSProperties = {
	fontSize: 11,
	fontWeight: 600,
	opacity: .7,
	whiteSpace: "nowrap",
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
