import { Connection } from "@/types"
import React, { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"
import TooltipWrapCmp from "@/components/TooltipWrapCmp"


interface Props {
	selected?: boolean
	title: string
	subtitle?: string
	variant?: number
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const CnnCompactRow: FunctionComponent<Props> = ({
	title,
	subtitle,
	selected,
	variant = 0,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!title) return null
	const titleCompact = title.slice(0, 2).toUpperCase()

	return (
		<TooltipWrapCmp
			content={<div>
				<div style={{ fontWeight: 700 }}>{title}</div>
				<div>{subtitle}</div>
			</div>}
			variant={variant}
		>
			<div style={cssRow(selected, variant)}
				onClick={onClick}
			>
				<div style={layoutSo.state.theme.texts.row.title}>
					{titleCompact}
				</div>
			</div>
		</TooltipWrapCmp>
	)
}

export default CnnCompactRow

const cssRow = (select: boolean, variant: number): React.CSSProperties => ({
	display: "flex", alignItems: 'center', justifyContent: 'center',
	cursor: "pointer",
	backgroundColor: select ? layoutSo.state.theme.palette.var[variant].bg : "rgb(0 0 0 / 20%)",
	color: select ? layoutSo.state.theme.palette.var[variant].fg : "unset",
	borderRadius: "50%",
	width: 30, height: 30,
})
