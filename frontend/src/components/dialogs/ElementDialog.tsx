import Dialog, { DialogProps } from "@/components/dialogs/Dialog"
import { FunctionComponent, useMemo } from "react"



export interface ElementDialogProps extends DialogProps {
	element: Element
}

const ElementDialog: FunctionComponent<ElementDialogProps> = ({
	element,
	...props
}) => {

	// STORE

	// HOOKs
	const top = useMemo(() => {
		if (!element) return null
		return element.getBoundingClientRect().y
	}, [element])

	// HANDLER

	// RENDER
	return (
		<Dialog	{...props}
			open={top != null}
			top={top}
		>
			{props.children}
		</Dialog>
	)
}

export default ElementDialog
