import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import Dialog from "../../dialogs/Dialog"
import List from "../../lists/List"



interface StoreMessageFormat{
	state: {
		format: MSG_FORMAT,
		formatsOpen:boolean

	},
	setFormat(format:MSG_FORMAT): void,
	setFormatsOpen(open:boolean): void,
}

interface Props {
	store?: StoreMessageFormat
}

const FormatDialog: FunctionComponent<Props> = ({
	store: formatSo,
}) => {

	// STORE
	const formatSa = useStore(formatSo as any) as typeof formatSo.state

	// HOOKs

	// HANDLER
	const handleClose = () => {
		formatSo.setFormatsOpen(false)
	}
	const handleSelect = (index: number) => {
		formatSo.setFormat(formats[index])
		formatSo.setFormatsOpen(false)
	}

	// RENDER
	const formats = Object.values(MSG_FORMAT)
	const indexSelect = formats.indexOf(formatSa.format)

	return (
		<Dialog
			open={formatSa.formatsOpen}
			title="FORMATS"
			width={90}
			store={formatSo as any}
			onClose={handleClose}
		>
			<List<string>
				items={formats}
				select={indexSelect}
				onSelect={handleSelect}
			/>
		</Dialog>
	)
}

export default FormatDialog
