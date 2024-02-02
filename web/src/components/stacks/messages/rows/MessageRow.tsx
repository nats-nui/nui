import IconButton from "@/components/buttons/IconButton"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import JsonRow from "@/components/formatters/json/JsonRow"
import TextRow from "@/components/formatters/text/TextRow"
import CopyIcon from "@/icons/CopyIcon"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { Message } from "@/types/Message"
import { FunctionComponent, useMemo, useState } from "react"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import dayjs from "dayjs"



interface Props {
	message?: Message
	format?: MSG_FORMAT
}

const MessageRow: FunctionComponent<Props> = ({
	message,
	format,
}) => {

	// STORE
	const [bttCopyVisible, setBttCopyVisible] = useState(false)

	// HOOKs

	// HANDLER
	const handleClipboardClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
		navigator.clipboard.writeText(message.payload)
	}
	const handleTitleEnter = () => setBttCopyVisible(true)
	const handleTitleLeave = () => setBttCopyVisible(false)

	// RENDER
	if (!message) return null
	const time = useMemo(
		() => message.receivedAt ? dayjs(message.receivedAt).format("YYYY-MM-DD HH:mm:ss") : null,
		[message.receivedAt]
	)

	return (
		<>
			<div style={cssTitle}
				onMouseEnter={handleTitleEnter}
				onMouseLeave={handleTitleLeave}
			>
				<div style={{ display: "flex", flex: 1 }}>
					{message.seqNum && <div style={{ width: 20 }}>{message.seqNum}</div>}
					<div style={cssTitleText}>{message.subject}</div>
				</div>
				{bttCopyVisible && (
					<TooltipWrapCmp content="COPY" variant={COLOR_VAR.CYAN}>
						<IconButton onClick={handleClipboardClick}>
							<CopyIcon />
						</IconButton>
					</TooltipWrapCmp>
				)}
			</div>

			{{
				[MSG_FORMAT.JSON]: <JsonRow text={message.payload} />,
				[MSG_FORMAT.TEXT]: <TextRow text={message.payload} />,
				[MSG_FORMAT.BASE64]: <Base64Cmp text={message.payload} maxChar={80} />,
				[MSG_FORMAT.HEX]: <HexTable text={message.payload} maxRows={10} />,
			}[format]}

			{time && <div style={{ display: "flex" }}>{time}</div>}
		</>
	)
}

export default MessageRow

const cssTitle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	height: 24,
	fontSize: 10,
}
const cssTitleText: React.CSSProperties = {
	flex: 1,
	color: layoutSo.state.theme.palette.default.fg2,
}