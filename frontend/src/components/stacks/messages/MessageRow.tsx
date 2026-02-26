import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import DividerRow from "@/components/formatters/divider/DividerRow"
import HexTable from "@/components/formatters/hex/HexTable"
import JsonRow from "@/components/formatters/json/JsonRow"
import ProtobufRow from "@/components/formatters/protobuf/ProtobufRow"
import TextRow from "@/components/formatters/text/TextRow"
import CloseIcon from "@/icons/CloseIcon"
import { MESSAGE_TYPE, Message } from "@/types/Message"
import { MSG_FORMAT, toFormat } from "@/utils/editor"
import { dateShow } from "@/utils/time"
import { FunctionComponent, useMemo, memo } from "react"
import cls from "./MessageRow.module.css"
import { CopyButton, IconButton, TooltipWrapCmp } from "@priolo/jack"



interface Props {
	message?: Message
	selected?: boolean,
	format?: MSG_FORMAT
	index?: number
	onClick?: (message: Message) => void
	onDelete?: (message: Message) => void
}

const MessageRow: FunctionComponent<Props> = ({
	message,
	selected,
	format,
	index,
	onClick,
	onDelete,
}) => {

	// STORE

	// HOOKs
	const time = useMemo(
		() => message.receivedAt ? dateShow(message.receivedAt) : null,
		[message.receivedAt]
	)

	// HANDLER
	const handleClick = () => onClick?.(message)
	const handleDeleteClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
		onDelete?.(message)
	}
	const handleCopyPayload = () => toFormat(message.payload, format)

	// RENDER
	if (!message) return null
	const clsBg = index % 2 == 0 ? cls.bg1 : cls.bg2
	const clsSelected = selected ? cls.selected : ""
	const clsRoot = `${cls.root} ${clsBg} ${clsSelected}`

	if (!!message.type) return <DividerRow
		style={{ backgroundColor: message.type == MESSAGE_TYPE.WARN ? "var(--color-primary-bg)" : null }}
		title={message.subject}
		children={message.payload}
		time={time}
		onDelete={onDelete ? () => onDelete(message) : undefined}
	/>

	return (
		<div className={`${clsRoot} jack-hover-container`}
			onClick={handleClick}
		>
			<div className={cls.title}>
				<span style={{ flex: 1 }}>
					<span className={cls.seq_num}>{message.seqNum} </span>
					<span className={`${cls.subject} jack-hover-container`}>
						{message.subject}
					</span>
				</span>
				<div className={`jack-hover-hide ${cls.box_actions} ${clsBg}`}>
					<CopyButton value={message.subject} label="COPY SUBJECT" />
					<CopyButton value={handleCopyPayload} />
					{!!onDelete && (
						<TooltipWrapCmp content="DELETE">
							<IconButton onClick={handleDeleteClick}>
								<CloseIcon />
							</IconButton>
						</TooltipWrapCmp>
					)}
				</div>
			</div>

			{{
				[MSG_FORMAT.JSON]: <JsonRow text={message.payload} />,
				[MSG_FORMAT.TEXT]: <TextRow text={message.payload} />,
				[MSG_FORMAT.BASE64]: <Base64Cmp text={message.payload} maxChar={80} />,
				[MSG_FORMAT.HEX]: <HexTable text={message.payload} maxRows={10} />,
				[MSG_FORMAT.PROTOBUF]: <ProtobufRow text={message.payload} subject={message.subject} />,
			}[format]}

			{time && (
				<div className={cls.footer}>{time}</div>
			)}
		</div>
	)
}

export default memo(MessageRow)
