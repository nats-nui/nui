import CloseIcon from "@/icons/CloseIcon"
import docsSo from "@/stores/docs"
import { CnnDetailState } from "@/stores/stacks/connection/detail"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import IconButton from "../buttons/IconButton"
import cls from "./Dialog.module.css"



export interface DialogProps {
	/** VIEW dove appiccicare questa DIALOG */
	store: ViewStore
	/** indica se la dialog è aperta o no */
	open?: boolean
	/** titolo della dialog (dai ci arrivavi da solo no?) */
	title?: React.ReactNode

	/** larghezza della DIALOG */
	width?: number | string
	fullHeight?: boolean
	/** spazio da lasciare in alto */
	top?: number
	style?: React.CSSProperties
	className?: string

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
	fullHeight,
	top = null,
	style,
	className,

	children,
	/** se minore di 0 non chiude automaticamente */
	timeoutClose = 200,
	onClose,
}) => {

	// STORE
	const state = useStore(store) as CnnDetailState

	// HOOKs
	const [ref, setRef] = useState<HTMLDivElement>(null)
	const [pointRef, setPointRef] = useState<HTMLDivElement>(null)
	const refDialog = useMemo(() => {
		if (!open || !pointRef) return null

		// guarda che devo fare per evitare che si aprano due dialog in zen
		const zenElm = document.getElementById(`zen-container`)
		const inZen = zenElm?.contains(pointRef) ?? false
		if ( docsSo.state.zenCard== store && !inZen) return null

		const elm = document.getElementById(`dialog_${state.uuid}`)
		return elm
	}, [open, pointRef])

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
			if (open == true && ref && !ref.contains(e.target as any)) {
				if (timeoutClose > 0) {
					setTimeout(() => onClose?.(e), timeoutClose)
				} else {
					onClose?.(e)
				}
			}
		}
		if (open && !!ref) {
			if (timeoutClose < 0) return
			document.addEventListener('mousedown', handleClick)
			//setTimeout(() => document.addEventListener('mousedown', handleClick), 100)
		}
		return () => {
			if (timeoutClose < 0) return
			document.removeEventListener('mousedown', handleClick)
		}
	}, [open, ref])

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
	//if (!refDialog) return null
	const clsRoot = `color-bg color-text ${cls.root} ${fullHeight ? cls.full_height : ""}`

	return <>

		<div ref={(node) => setPointRef(node)} style={{ display: "none" }} />

		{refDialog && createPortal(
			<div className={clsRoot}
				ref={(node) => setRef(node)}
				style={cssRoot(width, y)}
			>
				{title != null ? (
					<div className={cls.title}>
						<div className="lbl-dialog-title" style={{ flex: 1, marginRight: 5 }}>
							{title}
						</div>
						<IconButton onClick={(e) => onClose(e)}>
							<CloseIcon />
						</IconButton>
					</div>
				) : (
					<div style={{ height: 12 }} />
				)}

				<div className={`${cls.body} ${className}`} style={style}>
					{children}
				</div>

			</div>,
			refDialog
		)}
	</>
}

export default Dialog

const cssRoot = (width: number | string, top: number): React.CSSProperties => ({
	width,
	marginTop: top,
})
