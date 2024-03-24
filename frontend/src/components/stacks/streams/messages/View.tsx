import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import FindInput from "@/components/input/FindInput"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { Message } from "@/types/Message"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import FormatDialog from "../../../editor/FormatDialog"
import MessagesList from "../../messages/MessagesList"
import FilterDialog from "./FilterDialog"
import AlertDialog from "@/components/dialogs/AlertDialog"



interface Props {
	store?: StreamMessagesStore
}

const StreamMessagesView: FunctionComponent<Props> = ({
	store: strMsgSo,
}) => {

	// STORE
	const strMsgSa = useStore(strMsgSo)

	// HOOKs
	const [textFind, setTextFind] = useState(strMsgSa.textSearch ?? "")
	useEffect(() => {
		strMsgSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleFilterClick = () => strMsgSo.setFiltersOpen(true)
	const handleFormatsClick = () => strMsgSo.setFormatsOpen(true)
	const handleSearchChange = (value: string) => {
		setTextFind(value)
		debounce(`text-find-${strMsgSa.uuid}`, () => strMsgSo.setTextSearch(value), 2000)
	}
	const handleLoad = async (bottom: boolean) => {
		if (bottom) {
			return await strMsgSo.fetchNext()
		} else {
			return await strMsgSo.fetchPrev()
		}
	}
	const hendleMessageClick = (message: Message) => strMsgSo.openMessageDetail(message)
	const hendleMessageDelete = (message: Message) => strMsgSo.deleteMessage(message)

	// RENDER
	const messages = useMemo(() => strMsgSo.getFiltered(), [strMsgSa.textSearch, strMsgSa.messages])	
	const formatSel = strMsgSa.format?.toUpperCase() ?? ""

	return <FrameworkCard
		store={strMsgSo}
		actionsRender={<>
			<FindInput
				value={textFind}
				onChange={handleSearchChange}
			/>
			<Button
				select={strMsgSa.formatsOpen}
				children={formatSel}
				onClick={handleFormatsClick}
			/>
			<Button
				select={strMsgSa.filtersOpen}
				children="FILTERS"
				onClick={handleFilterClick}
			/>
		</>}
	>
		<MessagesList
			messages={messages}
			format={strMsgSa.format}
			onLoading={handleLoad}
			onMessageClick={hendleMessageClick}
			onMessageDelete={hendleMessageDelete}
			style={{ marginLeft: '-10px', marginRight: '-10px' }}
		/>

		<FilterDialog store={strMsgSo} />

		<FormatDialog store={strMsgSo} />

		<AlertDialog store={strMsgSo} />

	</FrameworkCard>
}

export default StreamMessagesView

