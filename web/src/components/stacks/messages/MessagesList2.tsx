import React, { FunctionComponent, useEffect, useInsertionEffect, useLayoutEffect, useRef, useState } from "react"
import MessageRow2 from "./MessageRow2"
import { HistoryMessage } from "@/stores/stacks/messages/utils"
import { debounce } from "@/utils/time"



interface Props {
	messages: HistoryMessage[]
}

const MessagesList2: FunctionComponent<Props> = ({
	messages,
}) => {

	// STORE

	// HOOKs
	const [messagesVisible, setMessagesVisible] = useState<HistoryMessage[]>(messages.slice(0, 20))


	const scrollRef = useRef<HTMLDivElement>(null)
	const noScroll = useRef(false)
	useLayoutEffect(() => {
		if (noScroll.current) return
		const node = scrollRef.current
		if (!node) return

		handleScroll()
		node.scrollTop = node.scrollHeight - node.clientHeight
		setTimeout( ()=> node.scrollTop = node.scrollHeight - node.clientHeight , 100 )
		
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

	const indexTopRef = useRef(0)
	const upHeightRef = useRef(0)
	const scrollHeightRef = useRef(2934)


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
			style={{ flex: 1,  overflowY: "auto" }}
		>

			<div style={{ height: scrollHeightRef.current, backgroundColor: "purple", overflowY: "hidden" }}>

				<div style={{ height: upHeightRef.current, backgroundColor: "red" }} />

				{messagesVisible.map((message, index) => (
					<MessageRow2 
						key={message.id} 
						message={message} 
						index={index+indexTopRef.current}
					/>
				))}

			</div>

			{/* <div style={{ height: downHeight, backgroundColor: "blue" }} /> */}

		</div>
	)
}

export default MessagesList2

