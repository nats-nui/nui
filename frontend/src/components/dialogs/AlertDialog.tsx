import Button from "@/components/buttons/Button"
import Dialog from "@/components/dialogs/Dialog"
import Box from "@/components/format/Box"
import { StreamsStore } from "@/stores/stacks/streams"
import { FunctionComponent } from "react"



interface Props {
	store?: StreamsStore
	open?: boolean
	onClose?: (ok: boolean) => void
}

const AlertDialog: FunctionComponent<Props> = ({
	store: streamsSo,
	open,
	onClose,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER

	return <Dialog
		title="ATTENTION"
		width={200}
		open={open}
		store={streamsSo}
		onClose={() => onClose(false)}
	>
		<div>Ma che davvero?</div>
		<Box>
			<Button label="Si" onClick={() => onClose(true)} />
			<Button label="No" onClick={() => onClose(false)} />
		</Box>
	</Dialog>
}

export default AlertDialog
