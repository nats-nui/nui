import { HistoryMessage } from "@/stores/stacks/messages"
import React, { FunctionComponent, useEffect, useRef, useState } from "react"
import MessageRow2 from "./MessageRow2"



interface Props {
	messages: HistoryMessage[]
}

const MessagesList2: FunctionComponent<Props> = ({
	messages,
}) => {

	// STORE

	// HOOKs
	const [upHeight, setUpHeight] = useState(0)
	const [scrollHeight, setScrollHeight] = useState(2934)
	const [messagesVisible, setMessagesVisible] = useState<HistoryMessage[]>(messages.slice(0, 20))


	const scrollRef = useRef<HTMLDivElement>(null)
	const noScroll = useRef(false)
	useEffect(() => {
		if (noScroll.current) return
		const node = scrollRef.current
		if (!node) return
		node.scrollTop = node.scrollHeight - node.clientHeight
		handleScroll()
	}, [messages])

	// HANDLER
	const handleDown = (_: React.MouseEvent) => {
		noScroll.current = true
	}
	const handleUp = (_: React.MouseEvent) => {
		const node = scrollRef.current
		if (node.scrollTop >= node.scrollHeight - node.clientHeight - 200) {
			noScroll.current = false
		}
	}

	// useEffect(()=>{
	// 	if (!scrollRef.current ) return
	// 	//scrollRef.current.scrollTop = 36
	// },[scrollRef.current])


	const handleScroll = () => {

		const node = scrollRef.current
		if ( !node ) return
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
		setUpHeight(heightTop)


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
		setScrollHeight(heightItems)
	}

	function getMessageHeight(message:HistoryMessage): number {
		return message.height ?? 50
	}


	// RENDER

	return (
		<div
			ref={scrollRef}
			onMouseDown={handleDown}
			onMouseUp={handleUp}
			onScroll={handleScroll as any}
			style={{ flex: 1, width: "250px", height: "100%", overflowY: "auto" }}
		>

			<div style={{ height: scrollHeight, backgroundColor: "purple", overflowY: "hidden" }}>

				<div style={{ height: upHeight, backgroundColor: "red" }} />

				{messagesVisible.map(message => (
					<MessageRow2 
						key={message.id} 
						message={message} 
					/>
				))}

			</div>

			{/* <div style={{ height: downHeight, backgroundColor: "blue" }} /> */}

		</div>
	)
}

export default MessagesList2

