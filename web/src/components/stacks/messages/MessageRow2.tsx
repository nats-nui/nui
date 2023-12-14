import { HistoryMessage } from "@/stores/stacks/messages/utils"
import { FunctionComponent, useCallback, useEffect, useRef, useState } from "react"
import layoutSo from "@/stores/layout"
import dayjs from "dayjs"
import JsonCmp from "./JsonCmp"



interface Props {
	message?: HistoryMessage
	index?: number
	onClick?: (message:HistoryMessage)=>void
}

const MessageRow2: FunctionComponent<Props> = ({
	message,
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
	const styRoot = {
		...cssRoot,
		backgroundColor: index % 2 == 0 ? layoutSo.state.theme.palette.default.bg : layoutSo.state.theme.palette.default.bg2,
	}
	const time = dayjs(message.timestamp).format("YYYY-MM-DD HH:MM")

	return (
		<div ref={ref} style={styRoot}
			onClick={handleClick}
		>
			<div style={cssTitle}>
				{message.title}
			</div>
			<JsonCmp json={message.json} />
			<div style={cssFooter}>
				{time}
			</div>
		</div>
	)
}

export default MessageRow2

const cssRoot: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	padding: 10,
}
const cssTitle: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
}
const cssBody: React.CSSProperties = {
	fontSize: 14,
	overflowWrap: "break-word",
}
const cssFooter: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
	alignSelf: "flex-end",
}