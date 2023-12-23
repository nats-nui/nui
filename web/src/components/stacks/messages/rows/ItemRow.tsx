import layoutSo from "@/stores/layout"
import { HistoryMessage, MSG_FORMAT, MSG_TYPE } from "@/stores/stacks/messages/utils"
import dayjs from "dayjs"
import { FunctionComponent, useEffect, useRef } from "react"
import MessageRow from "./MessageRow"



interface Props {
	message?: HistoryMessage
	format?: MSG_FORMAT
	index?: number
	onClick?: (message: HistoryMessage) => void
}

const ItemRow: FunctionComponent<Props> = ({
	message,
	format,
	index,
	onClick,
}) => {

	// STORE

	// HOOKs
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!ref.current || message.height || !ref.current.offsetHeight) return
		message.height = ref.current.offsetHeight
		setTimeout(() => {
			if (!ref.current) return
			message.height = ref.current.offsetHeight
		}, 100)
	}, [message])

	// HANDLER
	const handleClick = () => onClick?.(message)

	// RENDER
	if (!message) return null
	const time = !!message.timestamp ? dayjs(message.timestamp).format("YYYY-MM-DD HH:MM") : ""
	const type = message.type ?? MSG_TYPE.MESSAGE

	return (
		<div ref={ref} style={cssRoot(index)}
			onClick={handleClick}
		>
			{[
				// MESSAGE
				<MessageRow message={message} format={format} />,
				<div>INFO</div>,
				<div>WARNING</div>,
				<div>ERROR</div>,
			][type]}

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
	padding: 10,
})
const cssTitle: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
}
const cssFooter: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
	alignSelf: "flex-end",
}