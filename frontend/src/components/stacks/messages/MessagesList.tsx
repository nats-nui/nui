import Button from "@/components/buttons/Button"
import FloatButton from "@/components/buttons/FloatButton"
import ArrowDownIcon from "@/icons/ArrowDownIcon"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { Message } from "@/types/Message"
import { FunctionComponent, useRef, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import MessageRow from "./MessageRow"



interface Props {
	messages: Message[]
	format: MSG_FORMAT
	onMessageClick?: (message: Message) => void
	onMessageDelete?: (message: Message) => void
	onLoading?: (bottom: boolean) => Promise<number>
	style?: React.CSSProperties
}

const MessagesList: FunctionComponent<Props> = ({
	messages,
	format,
	onMessageClick,
	onMessageDelete,
	onLoading,
	style,
}) => {

	// STORE

	// HOOKs
	const virtuoso = useRef(null);
	// indica che dee automaticamente scrollare in basso se arriva un nuovo messaggio
	const [showButton, setShowButton] = useState(true)

	// HANDLER
	const handleMessageClick = (message: Message) => onMessageClick?.(message)
	const handleMessageDelete = (message:Message) => onMessageDelete?.(message)
	const handleKeepDownClick = () => {
		virtuoso.current.scrollToIndex({ index: messages.length - 1/*, behavior: 'smooth'*/ })
	}
	const handleStartReached = (index: number) => {
		console.log("handleStartReached", index)
		//onLoading?.(false)
	}
	const handleLoadEnd = () => onLoading?.(true)
	const handleLoadStart = () => onLoading?.(false)
	const handleBottomChange = (bottom: boolean) => setShowButton(!bottom)
	const handleTopChange = async (top: boolean) => {
		if (top) {
			const newItems = await onLoading?.(false)
			//setTimeout(() => virtuoso.current.scrollToIndex({ index: newItems }), 1000)
			console.log(newItems)
			if ( newItems > 0 ) virtuoso.current.scrollToIndex({ index: newItems })
		}
	}

	// RENDER
	if (!messages) return <div>no messages</div>
	return (<>
		<Virtuoso
			ref={virtuoso}
			style={{ height: "100%" }}

			// KEEP DOWN
			initialTopMostItemIndex={messages?.length - 1}
			atBottomStateChange={handleBottomChange}
			followOutput={'auto'}

			// LOADING
			startReached={handleStartReached}
			//endReached={handleEndReached}
			atTopStateChange={handleTopChange}

			// RENDERING
			data={messages}
			//computeItemKey={(index, item: Message) => item.seqNum}
			totalCount={messages?.length ?? 0}
			//overscan={200}
			defaultItemHeight={96}
			itemContent={(index, message) => (
				<MessageRow
					message={message}
					format={format}
					index={index}
					onClick={handleMessageClick}
					onDelete={handleMessageDelete}
				/>
			)}
			components={{
				Header: !!onLoading ? () => <Button label="LOAD PREVIOUS ONES" onClick={handleLoadStart} /> : null,
				Footer: !!onLoading ? () => <Button label="LOAD MOST RECENT" onClick={handleLoadEnd} /> : null,
			}}
		/>
		{showButton && (
			<FloatButton
				onClick={handleKeepDownClick}
			><ArrowDownIcon /></FloatButton>
		)}
	</>)
}

export default MessagesList
