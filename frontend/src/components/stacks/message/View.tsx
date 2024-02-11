import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import TextCmp from "@/components/formatters/text/TextCmp"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import JsonCmp from "../../formatters/json/JsonCmp"
import FormatDialog from "../messages/FormatDialog"



interface Props {
	store?: MessageStore
}

const MessageView: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessageState

	// HOOKs

	// HANDLER
	const handleFormatsClick = () => msgSo.setFormatsOpen(true)
	const handleCopyClick = () => navigator.clipboard.writeText(text)

	// RENDER
	const text = msgSa.message.payload
	const format = msgSa.format
	const formatLabel = format.toUpperCase()
	const variant = msgSa.colorVar

	return <FrameworkCard
		store={msgSo}
		actionsRender={<>
			<Button
				label="COPY"
				onClick={handleCopyClick}
				variant={variant}
			/>
			<Button
				select={msgSa.formatsOpen}
				label={formatLabel}
				onClick={handleFormatsClick}
				variant={variant}
			/>
		</>}
	>
		{{
			[MSG_FORMAT.JSON]: <JsonCmp text={text} />,
			[MSG_FORMAT.TEXT]: <TextCmp text={text} />,
			[MSG_FORMAT.BASE64]: <Base64Cmp text={text} />,
			[MSG_FORMAT.HEX]: <HexTable text={text} />,
		}[format]}

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessageView
