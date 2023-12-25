import StringRow from "@/components/lists/generic/StringRow"
import layoutSo from "@/stores/layout"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { MessagesState, MessagesStore } from "@/stores/stacks/messages"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Dialog from "../../dialogs/Dialog"
import List from "../../lists/generic/List"



interface Props {
	store?: MessagesStore | MessageStore
}

const FormatDialog: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo as any) as MessagesState | MessageState

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
			store={msgSo}
			onClose={handleClose}
		>
			<List<string>
				style={cssDialogTypes}
				items={formats}
				RenderRow={StringRow}
				onChangeSelect={handleSelect}
			/>
		</Dialog>
	)
}

export default FormatDialog

const cssDialogTypes: React.CSSProperties = {
	width: 70,
	flex: 1,
	padding: '10px 15px',
	backgroundColor: layoutSo.state.theme.palette.var[1].bg,
	color: layoutSo.state.theme.palette.var[1].fg,
}
