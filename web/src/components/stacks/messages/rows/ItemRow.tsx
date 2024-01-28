import layoutSo from "@/stores/layout"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { Message } from "@/types/Message"
import dayjs from "dayjs"
import { FunctionComponent, useMemo } from "react"
import MessageRow from "./MessageRow"



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

	// HOOKs

	// HANDLER
	const handleClick = () => onClick?.(message)

	// RENDER
	if (!message) return null
	const time = useMemo(
		() => !!message.receivedAt ? dayjs(message.receivedAt).format("YYYY-MM-DD HH:mm:ss") : "",
		[message.receivedAt]
	)

	return (
		<div style={cssRoot(index)}
			onClick={handleClick}
		>
			<MessageRow message={message} format={format} />

			<div style={cssFooter}>
				{time}
			</div>
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
const cssFooter: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
	alignSelf: "flex-end",
}