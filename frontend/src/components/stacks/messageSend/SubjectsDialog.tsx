import Dialog from "@/components/dialogs/Dialog"
import TextInput from "@/components/input/TextInput"
import List from "@/components/lists/List"
import cnnSo from "@/stores/connections"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/send"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"



interface Props {
	store?: MessageSendStore
}

const SubjectsDialog: FunctionComponent<Props> = ({
	store: sendSo,
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
		title="SUBJECT"
		width={150}
		store={sendSo}
		onClose={handleSubsClose}
	>
		<>
			<TextInput style={{ marginBottom: 10 }}
				value={sendSa.subject}
				onChange={handleSubChange}
			/>
			<List<Subscription> style={cssList}
				items={subs}
				select={select}
				RenderRow={({item})=>item.subject}
				onSelect={handleSubSelectChange}
			/>
		</>
	</Dialog>
}

export default SubjectsDialog

const cssList: React.CSSProperties = {
	flex: 1,
}