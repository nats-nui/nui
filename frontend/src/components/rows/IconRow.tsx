import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import CloseIcon from "@/icons/CloseIcon"
import layoutSo from "@/stores/layout"
import React, { FunctionComponent, useState } from "react"



interface Props  {
	selected?: boolean
	title: string
	subtitle?: string
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
	onClose?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const IconRow: FunctionComponent<Props> = ({
	title,
	subtitle,
	selected,
	onClick,
	onClose,
}) => {

	// STORE
	const [enter, setEnter] = useState(false)

	// HOOKs

	// HANDLER

	// RENDER
	if (!title) return null
	const titleCompact = title.slice(0, 2).toUpperCase()
	const showCloseBtt = enter && !!onClose

	return (
		<TooltipWrapCmp
			style={{ position: "relative"}}
			content={<div>
				<div style={{ fontWeight: 700 }}>{title}</div>
				<div>{subtitle}</div>
			</div>}
			onMouseOver={enter=>setEnter(enter)}
		>
			{showCloseBtt && <div style={cssBttCancel}
				onClick={onClose}
			><CloseIcon /></div>}

			<div style={cssRow(selected)} className="color-bg"
				onClick={onClick}
			>
				<div style={layoutSo.state.theme.texts.row.title}>
					{titleCompact}
				</div>
			</div>
		</TooltipWrapCmp>
	)
}

export default IconRow

const cssRow = (select: boolean): React.CSSProperties => ({
	display: "flex", alignItems: 'center', justifyContent: 'center',
	cursor: "pointer",
	backgroundColor: select ? null : "rgb(0 0 0 / 20%)",
	color: select ? "#393939" : "unset",
	borderRadius: "50%",
	border: "2px solid black",
	width: 30, height: 30,
})

const cssBttCancel:React.CSSProperties = {
	cursor: "pointer",
	display: "flex", alignItems: "center", justifyContent: 'center',
	position: "absolute", right: -7, top: -5,
	borderRadius: "50%",
	width: 16, height: 16,
	backgroundColor: "black",
}
