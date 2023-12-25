import Header from "@/components/Header"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import JsonCmp from "../../formatters/json/JsonCmp"
import ActionGroup from "@/components/buttons/ActionGroup"
import Button from "@/components/buttons/Button"
import FormatDialog from "../messages/FormatDialog"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import TextCmp from "@/components/formatters/text/TextCmp"
import HexTable from "@/components/formatters/hex/HexTable"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"



interface Props {
	store?: MessageStore
	style?: React.CSSProperties,
}

const MessageView: FunctionComponent<Props> = ({
	store: msgSo,
	style,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessageState

	// HOOKs

	// HANDLER
	const handleFormatsClick = () => msgSo.setFormatsOpen(true)

	// RENDER
	const text = msgSa.message.body
	const format = msgSa.format
	const formatLabel = format.toUpperCase()

	return (
		<div style={{ ...cssContainer, ...style }}>

			<Header view={msgSo} />

			<ActionGroup>
				<Button
					select={msgSa.formatsOpen}
					label={formatLabel}
					onClick={handleFormatsClick}
					colorVar={1}
				/>
			</ActionGroup>

			<div style={{ overflowY: "auto" }}>
				{{
					[MSG_FORMAT.JSON]: <JsonCmp text={text} style={{ margin: "15px 0px 15px 15px" }} />,
					[MSG_FORMAT.TEXT]: <TextCmp text={text} />,
					[MSG_FORMAT.BASE64]: <Base64Cmp text={text} />,
					[MSG_FORMAT.HEX]: <HexTable text={text} />,
				}[format]}
			</div>

			<FormatDialog store={msgSo} />
		</div>
	)
}

export default MessageView

const cssContainer: React.CSSProperties = {
	position: "relative",
	flex: 1,
	display: "flex",
	flexDirection: "column",
	height: "100%",
	width: "300px",
}
