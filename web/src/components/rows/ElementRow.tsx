import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"



interface Props {
	selected?: boolean
	title: string
	icon?: React.ReactNode
	subtitle?: string
	variant?: number
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * riga generica di lista figa
 */
const ElementRow: FunctionComponent<Props> = ({
	title,
	subtitle,
	icon,
	selected,
	variant = 0,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!title) return null

	return <div style={cssRow(selected, variant)}
		onClick={onClick}
	>
		{icon}
		<div style={cssLabels}>
			<div style={layoutSo.state.theme.texts.row.title}>{title}</div>
			<div style={layoutSo.state.theme.texts.row.subtitle}>{subtitle}</div>
		</div>
	</div>
}

export default ElementRow

const cssRow = (select: boolean, variant: number): React.CSSProperties => ({
	display: "flex", alignItems: "center",
	cursor: "pointer",
	backgroundColor: select ? layoutSo.state.theme.palette.var[variant].bg : "unset",
	color: select ? layoutSo.state.theme.palette.var[variant].fg : "unset",
	margin: "3px -10px 0px -5px",
	borderRadius: "20px 0px 0px 20px",
	padding: '4px 0px 4px 12px',
})

const cssLabels: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	marginLeft: '8px',
}
