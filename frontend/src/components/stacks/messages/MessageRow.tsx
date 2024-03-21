import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import JsonRow from "@/components/formatters/json/JsonRow"
import TextRow from "@/components/formatters/text/TextRow"
import CloseIcon from "@/icons/CloseIcon"
import CopyIcon from "@/icons/CopyIcon"
import { Message } from "@/types/Message"
import { MSG_FORMAT } from "@/utils/editor"
import dayjs from "dayjs"
import { FunctionComponent, useMemo, useState } from "react"
import cls from "./MessageRow.module.css"
import { dateShow } from "@/utils/time"


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
	
	// HOOKs
	const [bttCopyVisible, setBttCopyVisible] = useState(false)

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
		() => message.receivedAt ? dateShow(message.receivedAt) : null,
		[message.receivedAt]
	)
	const clsBg = index % 2 == 0 ? cls.bg1 : cls.bg2
	const clsRoot = `${cls.root} ${clsBg}`

	return (
		<div className={clsRoot}
			onClick={handleClick}
			onMouseEnter={handleTitleEnter}
			onMouseLeave={handleTitleLeave}
		>
			<div className={cls.title}>
				<div style={{ flex: 1 }}>
					{message.seqNum} <span className={cls.subject}>{message.subject}</span>
				</div>

				{bttCopyVisible && (
					<div className={`${cls.boxActions} ${clsBg}`}>
						<TooltipWrapCmp content="COPY">
							<IconButton onClick={handleClipboardClick}>
								<CopyIcon />
							</IconButton>
						</TooltipWrapCmp>
						{!!onDelete && (
							<TooltipWrapCmp content="DELETE">
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
				<div className={cls.footer}>{time}</div>
			)}
		</div>
	)
}

export default MessageRow
