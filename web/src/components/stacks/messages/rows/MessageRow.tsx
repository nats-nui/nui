import IconButton from "@/components/buttons/IconButton"
import Tooltip from "@/components/buttons/Tooltip"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import JsonRow from "@/components/formatters/json/JsonRow"
import TextRow from "@/components/formatters/text/TextRow"
import CopyIcon from "@/icons/CopyIcon"
import { HistoryMessage, MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { FunctionComponent, useState } from "react"
import layoutSo, { COLOR_VAR } from "@/stores/layout"



interface Props {
	message?: HistoryMessage
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
		navigator.clipboard.writeText(message.body)
	}
	const handleTitleEnter = () => setBttCopyVisible(true)
	const handleTitleLeave = () => setBttCopyVisible(false)

	// RENDER
	if (!message) return null

	return (
		<>
			<div style={cssTitle}
				onMouseEnter={handleTitleEnter}
				onMouseLeave={handleTitleLeave}
			>
				<div style={cssTitleText}>{message.title}</div>
				{bttCopyVisible && (
					<Tooltip content="COPY" variant={COLOR_VAR.CYAN}>
						<IconButton onClick={handleClipboardClick}>
							<CopyIcon />
						</IconButton>
					</Tooltip>
				)}
			</div>

			{{
				[MSG_FORMAT.JSON]: <JsonRow text={message.body} />,
				[MSG_FORMAT.TEXT]: <TextRow text={message.body} />,
				[MSG_FORMAT.BASE64]: <Base64Cmp text={message.body} maxChar={80} />,
				[MSG_FORMAT.HEX]: <HexTable text={message.body} maxRows={10} />,
			}[format]}
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