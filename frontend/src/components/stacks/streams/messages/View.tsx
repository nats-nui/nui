import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import FindInput from "@/components/input/FindInput"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { Message } from "@/types/Message"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"
import FormatDialog from "../../../editor/FormatDialog"
import MessagesList from "../../messages/MessagesList"
import FilterDialog from "./FilterDialog"



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
		strMsgSo.fetch()
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
			return await strMsgSo.fetchNext2()
		} else {
			return await strMsgSo.fetchPrev2()
		}
	}
	const hendleMessageClick = (message: Message) => strMsgSo.openMessageDetail(message)
	const hendleMessageDelete = (message: Message) => strMsgSo.deleteMessage(message)

	// RENDER
	const formatSel = strMsgSa.format?.toUpperCase() ?? ""
	const variant = strMsgSa.colorVar
	const messages = strMsgSa.messages

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
				variant={variant}
				onClick={handleFormatsClick}
			/>
			<Button
				select={strMsgSa.filtersOpen}
				children="FILTERS"
				onClick={handleFilterClick}
				variant={variant}
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

	</FrameworkCard>
}

export default StreamMessagesView

