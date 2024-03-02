import CloseIcon from "@/icons/CloseIcon"
import layoutSo from "@/stores/layout"
import { CnnDetailState } from "@/stores/stacks/connection/detail"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import IconButton from "../buttons/IconButton"
import Label, { LABELS } from "../format/Label"



export interface DialogProps {
	/** VIEW dove appiccicare questa DIALOG */
	store: ViewStore
	/** indica se la dialog è aperta o no */
	open?: boolean
	/** titolo della dialog (dai ci arrivavi da solo no?) */
	title?: React.ReactNode

	/** larghezza della DIALOG */
	width?: number | string
	/** spazio da lasciare in alto */
	top?: number

	/** un timeout in ms chiude la dialog se si clicca fuori
	 * se == -1 non chiude */
	timeoutClose?: number

	children?: React.ReactNode
	/** chiamato quando clicco su qualunque altro punto che non sia la DIALOG */
	onClose?: (e) => void
}

/**
 * dettaglio di una CONNECTION
 */
const Dialog: FunctionComponent<DialogProps> = ({
	store,
	open,
	title,
	width,
	top = null,
	children,
	timeoutClose = 200,
	onClose,
}) => {

	// STORE
	const state = useStore(store) as CnnDetailState

	// HOOKs
	const [ref, setRef] = useState<HTMLDivElement>(null)
	const refDialog = useMemo(() => {
		if (!open) return null
		const elm = document.getElementById(`dialog_${state.uuid}`)
		return elm
	}, [open])

	// pensare ad un modo per cui se cambiano le dimensioni della dialog
	// questa si riposiziona
	// *******************************************************************
	const [contentRect, setContentRect] = useState<DOMRectReadOnly>(null)
	useEffect(() => {
		if (!ref) return
		const resizeObserver = new ResizeObserver((entries) => {
			let rect: DOMRectReadOnly = null
			entries.forEach((entry) => rect = entry.contentRect)
			setContentRect(rect)
		})
		resizeObserver.observe(ref)
		return () => resizeObserver.unobserve(ref)
	}, [ref])

	/** EVENT CLICK */
	useEffect(() => {
		// se clicco fuori dalla dialog allora la chiude
		const handleClick = (e: MouseEvent) => {
			if (timeoutClose < 0) return
			// se è aperto e il "refDialog" contiene proprio questa dialog allora chiudi
			if (open == true && refDialog && !refDialog.contains(e.target as any)) {
				if (timeoutClose > 0) {
					setTimeout(() => onClose?.(e), timeoutClose)
				} else {
					onClose?.(e)
				}
			}
		}
		if (open) {
			if (timeoutClose < 0) return
			document.addEventListener('mousedown', handleClick)
			//setTimeout(() => document.addEventListener('mousedown', handleClick), 100)
		}
		return () => {
			if (timeoutClose < 0) return
			document.removeEventListener('mousedown', handleClick)
		}
	}, [open])

	const y = useMemo(() => {
		if (top == null) return 0
		if (!ref || open == false) return
		const rect = ref.getBoundingClientRect()
		const dialogHeight = rect.height
		const docHeight = document.documentElement.scrollHeight
		let y = top - (dialogHeight / 2)
		if (y + dialogHeight > docHeight) y = docHeight - dialogHeight - 20
		if (y < 0) y = 0
		//if (y > docHeight) y = docHeight - rect.height - 20
		return y
	}, [ref, open, top, contentRect])

	// HANDLER

	// RENDER
	if (!refDialog) return null
	const variant = state.colorVar

	return createPortal(
		<div
			ref={(node) => setRef(node)}
			style={cssRoot(variant, width, y)}
		>
			{title != null &&
				<div style={cssTitle}>
					<Label type={LABELS.TITLE_DIALOG} style={{ flex: 1 }}>{title}</Label>
					<IconButton onClick={(e) => onClose(e)}>
						<CloseIcon />
					</IconButton>
				</div>
			}

			<div style={cssBody}>
				{children}
			</div>

		</div>,
		refDialog
	)
}

export default Dialog

const cssRoot = (variant: number, width: number | string, top: number): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
	flex: 1,
	width,
	marginTop: top,
	padding: "15px 15px 15px 25px",
	backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
	color: layoutSo.state.theme.palette.var[variant].fg,

	//overflow: "hidden",
	borderRadius: '0px 10px 10px 0px',
	boxShadow: layoutSo.state.theme.shadows[0],

	maxHeight: `calc( 100% - 30px )`,

})

const cssTitle: React.CSSProperties = {
	display: "flex",
	marginBottom: 10,
	alignItems: "center",
}

const cssBody: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	overflowY: 'auto',
}