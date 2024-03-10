import Button from "@/components/buttons/Button"
import Dialog from "@/components/dialogs/Dialog"
import Box from "@/components/format/Box"
import { AlertState, ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: ViewStore
}

const AlertDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const storeSa = useStore(store)

	// HOOKs

	// HANDLER
	const handleClose = (ok: boolean) => {
		storeSa.alert.open = false
		store.setAlert({ ...storeSa.alert })
		storeSa.alert.resolve(ok)
	}

	// RENDER
	const alert = storeSa.alert

	return <Dialog
		title={alert.title}
		width={200}
		open={alert.open}
		store={store}
		onClose={() => handleClose(false)}
	>

		<div className="lbl-prop-title">DANGER</div>

		<div style={cssBGStop}></div>


		<div className="lbl-dialog-text">
			{alert.body}
		</div>

		<Box style={{display: "flex", gap: 15, marginTop: 10}}>
			<Button
				children={alert.labelOk}
				onClick={() => handleClose(true)}
			/>
			<Button
				children={alert.labelCancel}
				onClick={() => handleClose(false)}
			/>
		</Box>
	</Dialog>
}

export default AlertDialog

const cssBGStop:React.CSSProperties = {
	height: 50,
	background: `repeating-linear-gradient(
		135deg,
		${"transparent"},
		${"transparent"} 10px,
		#000 10px,
		#000 20px
	)`,
}