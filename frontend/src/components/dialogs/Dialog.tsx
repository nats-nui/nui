import CloseIcon from "@/icons/CloseIcon"
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

	noCloseOnClickParent?: boolean

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

	noCloseOnClickParent,
	onClose,
}) => {

	// STORE
	const state = useStore(store) as CnnDetailState

	// HOOKs
	const [ref, setRef] = useState<HTMLDivElement>(null)
	const refDialog = useMemo(() => {
		if (!open) return null
		return document.getElementById(`dialog_${state.uuid}`)
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
		// click fuori dalla dialog eventualmente chiude
		const handleClick = (e: MouseEvent) => {
			// se non serve controllare
			if (!open || !ref || !e.target) return
			// se ho cliccato sulla stessa dialog:
			if (ref.contains(e.target as any)) return
			// se non si deve chiudere sul click sul parent:
			if (noCloseOnClickParent) {
				const parentElm = document.getElementById(state.uuid)
				if ((e.target as Element).id != `dialog_${state.uuid}` && parentElm.contains(e.target as any)) return
			}
			// ... allora chudi!
			if (timeoutClose > 0) {
				setTimeout(() => onClose?.(e), timeoutClose)
			} else {
				onClose?.(e)
			}
		}
		if (open && !!ref) {
			// se minore di 0 non chiudere automaticamente
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
	const clsRoot = `color-bg color-text ${cls.root} ${fullHeight ? cls.full_height : ""}`

	return refDialog && createPortal(
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
	)
}

export default Dialog

const cssRoot = (width: number | string, top: number): React.CSSProperties => ({
	width,
	marginTop: top,
})
