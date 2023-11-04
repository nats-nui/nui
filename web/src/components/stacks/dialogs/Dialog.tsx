import { ViewStore } from "@/stores/docs/viewBase"
import { CnnDetailState } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"



interface Props {
	store: ViewStore
	children?: React.ReactNode
	closeClickOut?: boolean
}

/**
 * dettaglio di una CONNECTION
 */
const Dialog: FunctionComponent<Props> = ({
	store,
	children,
	closeClickOut = false,
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
			if (store.state.dialogOpen == true && refDialog && !refDialog.contains(e.target as any)) {
				store.setDialogOpen(false)
			}
		}
		if (store.state.dialogOpen) {
			setTimeout(() => document.addEventListener('click', handleClick), 100)
		}
		return () => {
			document.removeEventListener('click', handleClick)
		}
	}, [store.state.dialogOpen])

	// HANDLER

	// RENDER
	if (!refDialog) return null

	return createPortal(children, refDialog)
}

export default Dialog
