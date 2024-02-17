import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import JsonRow from "@/components/formatters/json/JsonRow"
import TextRow from "@/components/formatters/text/TextRow"
import CopyIcon from "@/icons/CopyIcon"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { Message } from "@/types/Message"
import dayjs from "dayjs"
import { FunctionComponent, useMemo, useState } from "react"



interface Props {
	message?: Message
	format?: MSG_FORMAT
	index?: number
	onClick?: (message: Message) => void
}

const ItemRow: FunctionComponent<Props> = ({
	message,
	format,
	index,
	onClick,
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
	const handleTitleEnter = () => setBttCopyVisible(true)
	const handleTitleLeave = () => setBttCopyVisible(false)

	// RENDER
	if (!message) return null
	const time = useMemo(
		() => message.receivedAt ? dayjs(message.receivedAt).format("YYYY-MM-DD HH:mm:ss") : null,
		[message.receivedAt]
	)

	return (
		<div style={cssRoot(index)}
			onClick={handleClick}
		>
			<div style={cssTitle}
				onMouseEnter={handleTitleEnter}
				onMouseLeave={handleTitleLeave}
			>
				<div style={{ display: "flex", flex: 1 }}>
					{!!message.seqNum && (
						<div style={{ width: 20 }}>{message.seqNum}</div>
					)}
					<div style={cssSubject}>{message.subject}</div>
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

			{time && (
				<div style={cssFooter}>{time}</div>
			)}
		</div>
	)
}

export default ItemRow

const cssRoot = (index: number): React.CSSProperties => ({
	backgroundColor: index % 2 == 0 ? layoutSo.state.theme.palette.default.bg : layoutSo.state.theme.palette.default.bg2,
	display: "flex",
	flexDirection: "column",
	padding: "0px 7px 5px 7px",
})

const cssTitle: React.CSSProperties = {
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