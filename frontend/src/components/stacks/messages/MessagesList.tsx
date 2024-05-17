import FloatButton from "@/components/buttons/FloatButton"
import ArrowDownIcon from "@/icons/ArrowDownIcon"
import ClearIcon from "@/icons/ClearIcon"
import { Message } from "@/types/Message"
import { MSG_FORMAT } from "@/utils/editor"
import { debounce } from "@/utils/time"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import MessageRow from "./MessageRow"



interface Props {
	messages: Message[]
	format: MSG_FORMAT
	onMessageClick?: (message: Message) => void
	onMessageDelete?: (message: Message) => void
	onClear?: () => void
	onLoading?: (bottom: boolean) => Promise<number>
	extraActions?: React.ReactNode
	style?: React.CSSProperties
	header?: React.ReactNode
	footer?: React.ReactNode
}

const MessagesList: FunctionComponent<Props> = ({
	messages,
	format,
	onMessageClick,
	onMessageDelete,
	onClear,
	onLoading,
	extraActions,
	style,
	header,
	footer,
}) => {

	// STORE

	// HOOKs
	const virtuoso = useRef<VirtuosoHandle>(null)
	// devo evitare che carichi alla CDC allo startup
	const loadingDisabled = useRef(false)
	useEffect(() => {
		loadingDisabled.current = true
		debounce(`messages-list`, () => loadingDisabled.current = false, 1000)
	}, [messages])
	// indica che dee automaticamente scrollare in basso se arriva un nuovo messaggio
	const [showKeepDown, setShowKeepDown] = useState(true)

	// HANDLER
	const handleKeepDownClick = () => {
		virtuoso.current.scrollToIndex({ index: messages.length - 1/*, behavior: 'smooth'*/ })
	}

	//const handleStartReached = async (index: number) => {
	// console.log("handleStartReached", index)
	// const newItems = await onLoading?.(false)
	// if (newItems > 0) virtuoso.current.scrollToIndex({ index: newItems })
	//}
	const handleBottomChange = (bottom: boolean) => setShowKeepDown(!bottom)
	const handleTopChange = async (top: boolean) => {
		if (loadingDisabled.current) return
		if (top) {
			const newItems = await onLoading?.(false)
			if (newItems > 0) virtuoso.current.scrollToIndex({ index: newItems })
		}
	}

	// RENDER
	const noMessage = !messages || messages.length == 0
	const canClear = !noMessage && !!onClear

	//if (!messages) return <div>no messages</div>

	return (<>
		<Virtuoso
			ref={virtuoso}
			style={{ ...style, height: "100%" }}

			// KEEP DOWN
			initialTopMostItemIndex={messages?.length - 1}
			atBottomStateChange={handleBottomChange}
			followOutput={'auto'}

			// LOADING
			//startReached={handleStartReached}
			//endReached={handleEndReached}
			atTopStateChange={handleTopChange}

			// RENDERING
			data={messages ?? []}
			//computeItemKey={(index, item: Message) => item.seqNum}
			totalCount={messages?.length ?? 0}
			//permette di ottimizzare con rendering preventivo su 200 pixel
			//overscan={200}
			defaultItemHeight={96}
			itemContent={(index, message) => <MessageRow
				message={message}
				format={format}
				index={index}
				onClick={onMessageClick}
				onDelete={onMessageDelete}
			/>}
			components={{
				Header: !!header && (() => header),
				Footer: !!footer && (() => footer),
				EmptyPlaceholder: () => <div className="lbl-empty color-fg">EMPTY LIST</div>,
			}}
		/>

		<div className="lyt-float" style={{ bottom: 30 }}>
			{extraActions}
			{showKeepDown &&
				<FloatButton
					onClick={handleKeepDownClick}
				><ArrowDownIcon /></FloatButton>
			}
			{canClear &&
				<FloatButton
					onClick={onClear}
				><ClearIcon /></FloatButton>
			}
		</div>

	</>)
}

export default MessagesList
