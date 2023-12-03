import { FunctionComponent } from "react"
import MessageRow from "./MessageRow"
import { HistoryMessage } from "@/stores/stacks/messages/utils"



interface Props {
	messages: HistoryMessage[]
}

const MessagesList: FunctionComponent<Props> = ({
	messages,
}) => {

	// STORE

	// HOOKs

	// RENDER

	return (
		<div
			style={{ flex: 1, width: "250px", height: "100%", overflowY: "auto" }}
		>

			{messages.map(message => (
				<MessageRow
					key={message.id}
					message={message}
				/>
			))}

		</div>
	)
}

export default MessagesList

