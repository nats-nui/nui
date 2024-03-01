import Button from "@/components/buttons/Button"
import Dialog from "@/components/dialogs/Dialog"
import Box from "@/components/format/Box"
import { StreamsStore } from "@/stores/stacks/streams"
import { FunctionComponent } from "react"



interface Props {
	store?: StreamsStore
	title?: string
	text?: string
	labelYes?: string
	labelNo?: string
	open?: boolean
	onClose?: (ok: boolean) => void
}

const AlertDialog: FunctionComponent<Props> = ({
	store: streamsSo,
	title,
	text,
	labelYes = "YES", 
	labelNo = "NO",
	open,
	onClose,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER

	return <Dialog
		title={title}
		width={200}
		open={open}
		store={streamsSo}
		onClose={() => onClose(false)}
	>
		<div style={cssText}>
			{text}
		</div>

		<Box style={{ display: "flex", gap: 15, justifyContent: 'flex-end' }}>
			<Button 
				label={labelYes} 
				onClick={() => onClose(true)} 
			/>
			<Button 
				label={labelNo} 
				onClick={() => onClose(false)} 
			/>
		</Box>
	</Dialog>
}

export default AlertDialog

const cssText:React.CSSProperties = {
	fontSize: 14,
	fontWeight: 500,
	marginBottom: 20,
	whiteSpace: "pre-line",
}