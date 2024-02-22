import { ViewStore } from "@/stores/stacks/viewBase"
import { CnnDetailState } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import layoutSo from "@/stores/layout"
import Label, { LABELS } from "../format/Label"
import CloseIcon from "@/icons/CloseIcon"
import IconButton from "../buttons/IconButton"



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
	children?: React.ReactNode
	/** se true(default) chiudo la dialog se clicco su un qualunque altro punto della pagina */
	closeClickOut?: boolean
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
	closeClickOut = true,
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
	// const [contentRect, setContentRect] = useState<DOMRectReadOnly>(null)
	// useEffect(() => {
	// 	if (!ref) return
	// 	const resizeObserver = new ResizeObserver((entries) => {
	// 		let rect: DOMRectReadOnly = null
	// 		entries.forEach((entry) => rect = entry.contentRect)
	// 		setContentRect(rect)
	// 	})
	// 	return () => resizeObserver.unobserve(ref)
	// }, [ref])

	/** EVENT CLICK */
	useEffect(() => {
		// se clicco fuori dalla dialog allora la chiude
		const handleClick = (e: MouseEvent) => {
			if (!closeClickOut) return
			// se è aperto e il "refDialog" contiene proprio questa dialog allora chiudi
			if (open == true && refDialog && !refDialog.contains(e.target as any)) {
				//setTimeout(() => onClose?.(), 300)
				onClose?.(e)
			}
		}
		if (open) {
			if (!closeClickOut) return
			document.addEventListener('mousedown', handleClick)
			//setTimeout(() => document.addEventListener('mousedown', handleClick), 100)
		}
		return () => {
			if (!closeClickOut) return
			document.removeEventListener('mousedown', handleClick)
		}
	}, [open])

	const y = useMemo(() => {
		if (top == null) return 0
		if (!ref || open == false) return
		const rect = ref.getBoundingClientRect()
		const docHeight = document.documentElement.scrollHeight
		let y = top - (rect.height / 2)
		if (y + rect.height > docHeight) y = docHeight - rect.height - 20
		if (y < 0) y = 0
		//if (y > docHeight) y = docHeight - rect.height - 20

		return y
	}, [ref, open, top])

	// HANDLER

	// RENDER
	if (!refDialog) return null
	const variant = state.colorVar

	return createPortal(
		<div
			ref={(node) => setRef(node)}
			style={cssRoot(variant, width, y)}
		>
			<div style={{ display: "flex" }}>
				<Label type={LABELS.TITLE_DIALOG} style={{ flex: 1 }}>{title}</Label>
				<IconButton onClick={(e) => onClose(e)}>
					<CloseIcon />
				</IconButton>
			</div>
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
	gap: 5,
	width,
	marginTop: top,
	padding: "10px 10px 10px 15px",
	backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
	color: layoutSo.state.theme.palette.var[variant].fg,

	//overflow: "hidden",
	borderRadius: '0px 10px 10px 0px',
	boxShadow: layoutSo.state.theme.shadows[0],

	maxHeight: 'calc( 100% - 20px )',
	
})

const cssBody:React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	overflowY: 'auto',
}