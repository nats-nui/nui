import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import CloseIcon from "@/icons/CloseIcon"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useState } from "react"



interface Props {
	icon: React.ReactNode
	tooltip?: string
	selected?: boolean
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
	onClose?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const LinkButton: FunctionComponent<Props> = ({
	icon,
	tooltip,
	selected,
	onClick,
	onClose,
}) => {

	// STORE
	const [enter, setEnter] = useState(false)

	// HOOKs

	// HANDLER

	// RENDER
	const showCloseBtt = enter && !!onClose

	return (
		<TooltipWrapCmp
			content={<div>
				<div style={{ fontWeight: 700 }}>{tooltip}</div>
			</div>}
			onMouseOver={enter => setEnter(enter)}
		>
			{showCloseBtt && <div style={cssBttCancel}
				onClick={onClose}
			><CloseIcon /></div>}

			<div style={cssRow(selected)}
				onClick={onClick}
			>
				{icon}
			</div>
		</TooltipWrapCmp>
	)
}

export default LinkButton

const cssRow = (select: boolean): React.CSSProperties => ({
	...select && {
		color: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].fg,
		backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	},

	transition: `background-color ${ANIM_TIME_CSS}ms, color ${ANIM_TIME_CSS}ms`,
	display: "flex", alignItems: 'center', justifyContent: 'center',
	cursor: "pointer",
	borderRadius: "5px 0px 0px 5px",
	width: 30, height: 30,
	padding: "3px 4px 3px 0px",
	marginRight: '-4px',
})

const cssBttCancel: React.CSSProperties = {
	cursor: "pointer",
	display: "flex", alignItems: "center", justifyContent: 'center',
	position: "absolute", right: -7, top: -5,
	borderRadius: "50%",
	width: 16, height: 16,
	backgroundColor: "black",
}
