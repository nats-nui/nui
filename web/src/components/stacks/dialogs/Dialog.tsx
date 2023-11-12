import { ViewStore } from "@/stores/docs/viewBase"
import { CnnDetailState } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"



interface Props {
	store: ViewStore
	children?: React.ReactNode
	/** se true(default) chiudo la dialog se clicco su un qualunque altro punto della pagina */
	closeClickOut?: boolean
	onClose?: ()=>void
}

/**
 * dettaglio di una CONNECTION
 */
const Dialog: FunctionComponent<Props> = ({
	store,
	children,
	closeClickOut = true,
	onClose,
}) => {

	// STORE
	const state = useStore(store) as CnnDetailState

	// HOOKs
	const refDialog = useMemo(() => {
		if (!state.dialogOpen) return null
		const elm = document.getElementById(`dialog_${state.uuid}`)
		return elm
	}, [state.dialogOpen])

	useEffect(() => {
		// se clicco fuori dalla dialog allora la chiude
		const handleClick = (e: MouseEvent) => {
			if ( !closeClickOut ) return
			if (store.state.dialogOpen == true && refDialog && !refDialog.contains(e.target as any)) {
				store.setDialogOpen(false)
				onClose?.()
			}
		}
		if (store.state.dialogOpen) {
			if ( !closeClickOut ) return
			setTimeout(() => document.addEventListener('mousedown', handleClick), 100)
		}
		return () => {
			if ( !closeClickOut ) return
			document.removeEventListener('mousedown', handleClick)
		}
	}, [store.state.dialogOpen])

	// HANDLER

	// RENDER
	if (!refDialog) return null

	return createPortal(children, refDialog)
}

export default Dialog
