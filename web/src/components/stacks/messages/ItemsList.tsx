import { HistoryMessage, MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { FunctionComponent, useRef, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import ItemRow from "./rows/ItemRow"
import FloatButton from "@/components/buttons/FloatButton"
import ArrowDownIcon from "@/icons/ArrowDownIcon"



interface Props {
	messages: HistoryMessage[]
	format: MSG_FORMAT
	onMessageClick?: (message: HistoryMessage) => void
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
	const virtuoso = useRef(null);
	// indica che dee automaticamente scrollare in basso se arriva un nuovo messaggio
	const [showButton, setShowButton] = useState(true)

	// HANDLER
	const handleMessageClick = (message: HistoryMessage) => onMessageClick?.(message)
	const handleKeepDownClick = () => {
		virtuoso.current.scrollToIndex({ index: messages.length - 1/*, behavior: 'smooth'*/ })
	}

	// RENDER
	return (<>
		<Virtuoso
			ref={virtuoso}
			className="var2"
			style={{ height: "100%" }}
			atBottomStateChange={(bottom) => {
				setShowButton(!bottom)
			}}
			followOutput={'auto'}
			data={messages}
			defaultItemHeight={96}
			itemContent={(index, message) => (
				<ItemRow
					message={message}
					format={format}
					index={index}
					onClick={handleMessageClick}
				/>
			)}
		/>
		{showButton && (
			<FloatButton
				onClick={handleKeepDownClick}
			><ArrowDownIcon /></FloatButton>
		)}
	</>)
}

export default ItemsList
