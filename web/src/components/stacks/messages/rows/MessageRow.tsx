import { HistoryMessage, MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { FunctionComponent } from "react"
import JsonRow from "@/components/formatters/json/JsonRow"
import TextRow from "@/components/formatters/text/TextRow"
import HexTable from "@/components/formatters/hex/HexTable"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"



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
				[MSG_FORMAT.JSON]: <JsonRow text={message.body} />,
				[MSG_FORMAT.TEXT]: <TextRow text={message.body} />,
				[MSG_FORMAT.BASE64]: <Base64Cmp text={message.body} maxChar={80} />,
				[MSG_FORMAT.HEX]: <HexTable text={message.body} maxRows={10}/>,
			}[format]}
		</>
	)
}

export default MessageRow

const cssTitle: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
}