import Dialog from "@/components/dialogs/Dialog"
import List from "@/components/lists/List"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/connection/messageSend"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"



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
		sendSo.setSubject(sendSa.subjects[index])
		sendSo.setSubsOpen(false)
	}
	const handleSubsClose = () => {
		sendSo.setSubsOpen(false)
	}

	// RENDER
	const select = useMemo(
		() => sendSa.subjects.findIndex(s => s == sendSa.subject),
		[sendSa.subjects, sendSa.subject]
	)

	return <Dialog
		open={sendSa.subsOpen}
		title="SUBJECT"
		width={150}
		store={sendSo}
		onClose={handleSubsClose}
	>
		<List<string> style={{ flex: 1 }}
			items={sendSa.subjects}
			select={select}
			onSelect={handleSubSelectChange}
		/>
	</Dialog>
}

export default SubjectsDialog
