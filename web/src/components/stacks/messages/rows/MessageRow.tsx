import { HistoryMessage, MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { FunctionComponent } from "react"
import JsonCompactCmp from "@/components/formatters/json/JsonCompactCmp"
import TextCmp from "@/components/formatters/TextCmp"



interface Props {
	message?: HistoryMessage
	format?: MSG_FORMAT
}

const MessageRow: FunctionComponent<Props> = ({
	message,
	format,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!message) return null

	return (
		<>
			<div style={cssTitle}>
				{message.title}
			</div>

			{{
				[MSG_FORMAT.JSON]: <JsonCompactCmp text={message.body} />,
				[MSG_FORMAT.TEXT]: <TextCmp text={message.body} />,
				[MSG_FORMAT.BASE64]: <TextCmp text={message.body} />,
				[MSG_FORMAT.HEX]: <TextCmp text={message.body} />,
			}[format]}
		</>
	)
}

export default MessageRow

const cssTitle: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
}