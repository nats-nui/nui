import { ViewStore } from "@/stores/stacks/viewBase"
import { CnnDetailState } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import layoutSo from "@/stores/layout"
import Label, { LABEL_TYPES } from "../input/Label"



interface Props {
	store: ViewStore
	open: boolean
	title?: React.ReactNode
	width?: number | string
	children?: React.ReactNode
	/** se true(default) chiudo la dialog se clicco su un qualunque altro punto della pagina */
	closeClickOut?: boolean
	onClose?: () => void
}

/**
 * dettaglio di una CONNECTION
 */
const Dialog: FunctionComponent<Props> = ({
	store,
	open,
	title,
	width,
	children,
	closeClickOut = true,
	onClose,
}) => {

	// STORE
	const state = useStore(store) as CnnDetailState

	// HOOKs
	const refDialog = useMemo(() => {
		if (!open) return null
		const elm = document.getElementById(`dialog_${state.uuid}`)
		return elm
	}, [open])

	useEffect(() => {
		// se clicco fuori dalla dialog allora la chiude
		const handleClick = (e: MouseEvent) => {
			if (!closeClickOut) return
			// se è aperto e il "refDialog" contiene proprio questa dialog allora chiudi
			if (open == true && refDialog && !refDialog.contains(e.target as any)) {
				setTimeout(() => onClose?.(), 300)
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

	// HANDLER

	// RENDER
	if (!refDialog) return null
	const variant = store.getColorVar()

	return createPortal(
		<div style={cssRoot(variant, width)}>
			<Label type={LABEL_TYPES.TITLE_DIALOG}>{title}</Label>
			{children}
		</div>,
		refDialog
	)
}

export default Dialog

const cssRoot = (variant: number, width: number | string): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
	flex: 1,
	width: width,
	padding: "10px 10px 10px 15px",
	backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
	color: layoutSo.state.theme.palette.var[variant].fg,
})