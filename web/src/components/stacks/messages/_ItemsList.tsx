import FloatButton from "@/components/buttons/FloatButton"
import ArrowDownIcon from "@/icons/ArrowDownIcon"
import { HistoryMessage, MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import ItemRow from "./rows/ItemRow"



interface Props {
	messages: HistoryMessage[]
	format: MSG_FORMAT
	onMessageClick?: (message:HistoryMessage)=>void
	style?: React.CSSProperties
}

const ItemsList: FunctionComponent<Props> = ({
	messages,
	format,
	onMessageClick,
	style,
}) => {

	// STORE

	// HOOKs
	const [messagesVisible, setMessagesVisible] = useState<HistoryMessage[]>(messages.slice(0, 20))
	// riferimento al contenitore scrollabile
	const scrollRef = useRef<HTMLDivElement>(null)
	const indexTopRef = useRef(0)
	const upHeightRef = useRef(0)
	const scrollHeightRef = useRef(849)
	// indica che dee automaticamente scrollare in basso se arriva un nuovo messaggio
	const [keepDown, setKeepDown] = useState(true)

	// quiandi la lista dei messaggio è aggiornata
	useEffect(() => {
		const node = scrollRef.current
		if (!node) return
		setTimeout(()=>{
			updateScroll()
			if (!keepDown) return
			node.scrollTop = node.scrollHeight - node.clientHeight
		}, 200)
		// updateScroll()
		// if (!keepDown) return
		// node.scrollTop = node.scrollHeight - node.clientHeight
		// setTimeout(() => node.scrollTop = node.scrollHeight - node.clientHeight + 200, 100)
	}, [messages, format])

	// HANDLER
	const handleStopKeepDown = () => {
		setKeepDown(false)
	}
	const handleKeepDownClick = () => {
		setKeepDown(true)
		const node = scrollRef.current
		node.scrollTop = node.scrollHeight - node.clientHeight
	}
	const handleScroll = () => {
		updateScroll()
	}
	const handleMessageClick = (message:HistoryMessage) => onMessageClick?.(message)

	const updateScroll = () => {
		const node = scrollRef.current
		if (!node) return
		const marginTop = -1000
		const marginDown = 1000


		let heightTop = 0
		let indexTop = 0
		const limitTop = node.scrollTop + marginTop
		for (; indexTop < messages.length; indexTop++) {
			const message = messages[indexTop]
			const nextHeight = heightTop + getMessageHeight(message)
			if (nextHeight > limitTop) break
			heightTop = nextHeight
		}
		upHeightRef.current = heightTop

		indexTopRef.current = indexTop
		let indexCenter = indexTop
		let heightItems = heightTop
		const limitCenter = node.scrollTop + node.clientHeight - marginTop + marginDown
		for (; indexCenter < messages.length; indexCenter++) {
			if (heightItems > limitCenter) break
			const message = messages[indexCenter]
			heightItems += getMessageHeight(message)
		}
		const items = messages.slice(indexTop, indexCenter)
		setMessagesVisible(items)


		for (let indexDown = indexCenter; indexDown < messages.length; indexDown++) {
			const message = messages[indexDown]
			heightItems += getMessageHeight(message)
		}
		scrollHeightRef.current = heightItems
	}
	function getMessageHeight(message: HistoryMessage): number {
		return message.height ?? 100
	}

	// RENDER
	return (
		<div
			ref={scrollRef}
			onMouseDown={handleStopKeepDown}
			onWheel={handleStopKeepDown}
			onScroll={handleScroll as any}
			style={{ ...cssRoot, ...style}}
			className="var2"
		>

			<div style={{ height: scrollHeightRef.current/*, backgroundColor: "purple", overflowY: "hidden"*/ }}>

				<div style={{ height: upHeightRef.current/*, backgroundColor: "red" */}} />

				{messagesVisible.map((message, index) => (
					<ItemRow
						key={message.id}
						message={message}
						format={format}
						index={index + indexTopRef.current}
						onClick={handleMessageClick}
					/>
				))}

			</div>

			{!keepDown && (
				<FloatButton
					onClick={handleKeepDownClick}
				><ArrowDownIcon /></FloatButton>
			)}

		</div>
	)
}

export default ItemsList

const cssRoot:React.CSSProperties = {
	flex: 1, 
	overflowY: "auto",
}

