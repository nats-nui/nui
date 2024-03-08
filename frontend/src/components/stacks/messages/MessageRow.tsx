import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import JsonRow from "@/components/formatters/json/JsonRow"
import TextRow from "@/components/formatters/text/TextRow"
import CloseIcon from "@/icons/CloseIcon"
import CopyIcon from "@/icons/CopyIcon"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { MSG_FORMAT } from "@/utils/editor"
import { Message } from "@/types/Message"
import dayjs from "dayjs"
import { FunctionComponent, useMemo, useState } from "react"



interface Props {
	message?: Message
	format?: MSG_FORMAT
	index?: number
	onClick?: (message: Message) => void
	onDelete?: (message: Message) => void
}

const MessageRow: FunctionComponent<Props> = ({
	message,
	format,
	index,
	onClick,
	onDelete,
}) => {

	// STORE
	const [bttCopyVisible, setBttCopyVisible] = useState(false)

	// HOOKs

	// HANDLER
	const handleClick = () => onClick?.(message)
	const handleClipboardClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
		navigator.clipboard.writeText(message.payload)
	}
	const handleDeleteClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
		onDelete?.(message)
	}
	const handleTitleEnter = () => setBttCopyVisible(true)
	const handleTitleLeave = () => setBttCopyVisible(false)

	// RENDER
	if (!message) return null
	const time = useMemo(
		() => message.receivedAt ? dayjs(message.receivedAt).format("YYYY-MM-DD HH:mm:ss") : null,
		[message.receivedAt]
	)
	const bgcolor = index % 2 == 0 ? layoutSo.state.theme.palette.default.bg : layoutSo.state.theme.palette.default.bg2

	return (
		<div style={cssRoot(bgcolor)}
			onClick={handleClick}
			onMouseEnter={handleTitleEnter}
			onMouseLeave={handleTitleLeave}
		>
			<div style={cssTitle}>
				<div style={{ flex: 1 }}>
					{message.seqNum} <span style={cssSubject}>{message.subject}</span>
				</div>

				{bttCopyVisible && (
					<div style={{ position: "absolute", top: 0, right: 0, backgroundColor: bgcolor, display: "flex" }}>
						<TooltipWrapCmp content="COPY" variant={COLOR_VAR.CYAN}>
							<IconButton onClick={handleClipboardClick}>
								<CopyIcon />
							</IconButton>
						</TooltipWrapCmp>
						{!!onDelete && (
							<TooltipWrapCmp content="DELETE" variant={COLOR_VAR.CYAN}>
								<IconButton onClick={handleDeleteClick}>
									<CloseIcon />
								</IconButton>
							</TooltipWrapCmp>
						)}
					</div>
				)}
			</div>

			{{
				[MSG_FORMAT.JSON]: <JsonRow text={message.payload} />,
				[MSG_FORMAT.TEXT]: <TextRow text={message.payload} />,
				[MSG_FORMAT.BASE64]: <Base64Cmp text={message.payload} maxChar={80} />,
				[MSG_FORMAT.HEX]: <HexTable text={message.payload} maxRows={10} />,
			}[format]}

			{time && (
				<div style={cssFooter}>{time}</div>
			)}
		</div>
	)
}

export default MessageRow

const cssRoot = (bgcolor: string): React.CSSProperties => ({
	backgroundColor: bgcolor,
	display: "flex",
	flexDirection: "column",
	padding: "0px 7px 5px 7px",
})

const cssTitle: React.CSSProperties = {
	position: "relative",
	display: "flex",
	alignItems: "start",
	//height: 24,
	fontSize: 10,
}

const cssSubject: React.CSSProperties = {
	flex: 1,
	color: layoutSo.state.theme.palette.default.fg2,
	overflowWrap: "anywhere",
}

const cssFooter: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
	alignSelf: "flex-end",
}