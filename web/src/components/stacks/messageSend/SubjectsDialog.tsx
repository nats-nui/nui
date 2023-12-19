import Dialog from "@/components/dialogs/Dialog"
import Label, { LABEL_TYPES } from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import List from "@/components/lists/generic/List"
import SubscriptionRow from "@/components/lists/generic/SubscriptionRow"
import cnnSo from "@/stores/connections"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/send"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"



interface Props {
	store?: MessageSendStore
	style?: React.CSSProperties,
}

const SubjectsDialog: FunctionComponent<Props> = ({
	store: sendSo,
	style,
}) => {

	// STORE
	const sendSa = useStore(sendSo) as MessageSendState

	// HOOKs

	// HANDLER
	const handleSubSelectChange = (index: number) => {
		sendSo.setSubject(subs[index].subject)
		sendSo.setSubsOpen(false)
	}
	const handleSubChange = (value: string) => {
		sendSo.setSubject(value)
	}
	const handleSubsClose = () => {
		sendSo.setSubsOpen(false)
	}

	// RENDER
	const cnn = cnnSo.getById(sendSa.connectionId)
	const subs = cnn?.subscriptions ?? []
	const select = subs.findIndex(s => s.subject == sendSa.subject)

	return <Dialog
		open={sendSa.subsOpen}
		store={sendSo}
		onClose={handleSubsClose}
	>
		<div style={cssForm}>
			<Label type={LABEL_TYPES.SUB_TITLE}>SUBJECT</Label>
			<TextInput style={{marginBottom: 10}}
				value={sendSa.subject}
				onChange={handleSubChange}
			/>
			<List<Subscription> style={cssList}
				items={subs}
				select={select}
				RenderRow={SubscriptionRow}
				onChangeSelect={handleSubSelectChange}
			/>
		</div>
	</Dialog>
}

export default SubjectsDialog

const cssForm: React.CSSProperties = {
	display: "flex", flexDirection: "column", flex: 1,
	width: 150,
	padding: '11px 10px 10px 15px',
	backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,
	color: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].fg,
}

const cssList: React.CSSProperties = {
	flex: 1,
}