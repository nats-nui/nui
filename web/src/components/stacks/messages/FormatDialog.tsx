import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import Dialog from "../../dialogs/Dialog"
import List from "../../lists/List"



interface StoreMessageFormat{
	state: {
		formatsOpen:boolean
	},
	setFormat(format:MSG_FORMAT): void,
	setFormatsOpen(open:boolean): void,
}

interface Props {
	store?: StoreMessageFormat
}

const FormatDialog: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo as any) as typeof msgSo.state

	// HOOKs

	// HANDLER
	const handleClose = () => {
		msgSo.setFormatsOpen(false)
	}
	const handleSelect = (index: number) => {
		msgSo.setFormat(formats[index])
		msgSo.setFormatsOpen(false)
	}

	// RENDER
	const formats = Object.values(MSG_FORMAT)

	return (
		<Dialog
			open={msgSa.formatsOpen}
			title="FORMATS"
			width={90}
			store={msgSo as any}
			onClose={handleClose}
		>
			<List<string>
				items={formats}
				onSelect={handleSelect}
			/>
		</Dialog>
	)
}

export default FormatDialog
