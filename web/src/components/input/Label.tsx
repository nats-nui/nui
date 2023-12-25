import React, { FunctionComponent } from "react"

export enum LABEL_TYPES {
	TEXT = 0,
	SUB_TITLE,
	TITLE,
	TITLE_DIALOG,
}

interface Props {
	type?: number
	onClick?: (e:React.MouseEvent) => void
	children?: React.ReactNode
	style?: React.CSSProperties

}

const Label: FunctionComponent<Props> = ({
	type = LABEL_TYPES.TEXT,
	onClick,
	children,
	style,
}) => {

	// STORE

	// HOOK

	// HANDLER

	// RENDER
	const css = {
		cursor: !!onClick ? "pointer" : null,
		...cssRoot,
		...[cssNormal, cssSubTitle, cssTitle, cssTitleDialog][type] ?? cssNormal,
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

const cssNormal: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	marginTop: 5,
}
const cssSubTitle: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
}
const cssTitle: React.CSSProperties = {
	fontSize: 22,
	lineHeight: "23px",
	fontWeight: 800,
	fontFamily: "Darker Grotesque",
}
const cssTitleDialog: React.CSSProperties = {
	fontSize: 22,
	lineHeight: "23px",
	fontWeight: 800,
	fontFamily: "Darker Grotesque",
}

const cssRoot: React.CSSProperties = {
	// ATTENZIONE SE METTO QUESTI NON MI FA IL TRUNCATE
	//display: "flex",
	//alignItems: "center",
	overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
}
