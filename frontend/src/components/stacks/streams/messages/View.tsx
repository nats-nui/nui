import FrameworkCard from "@/components/cards/FrameworkCard"
import DividerRow, { DIVIDER_VARIANT } from "@/components/formatters/divider/DividerRow"
import ArrowDownIcon from "@/icons/ArrowDownIcon"
import ArrowUpIcon from "@/icons/ArrowUpIcon"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { LOAD_STATE } from "@/stores/stacks/utils"
import { Message } from "@/types/Message"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import MessageIcon from "../../../../icons/cards/MessageIcon"
import FormatDialog from "../../../editor/FormatDialog"
import clsCardRedeye from "../../CardCyanDef.module.css"
import clsCardBoring from "../../CardBoringDef.module.css"
import MessagesList from "../../messages/MessagesList"
import FilterDialog from "./FilterDialog"
import { AlertDialog, Button, CircularLoadingCmp, FindInputHeader, OptionsCmp } from "@priolo/jack"
import { MessageStore } from "../../../../stores/stacks/message"
import { DOC_TYPE } from "../../../../types"
import { getStreamFormat } from "@/utils/streamFormatCache"
import layoutSo from "@/stores/layout"



interface Props {
	store?: StreamMessagesStore
}

const StreamMessagesView: FunctionComponent<Props> = ({
	store: strMsgSo,
}) => {

	// STORE
	const strMsgSa = useStore(strMsgSo)
	useStore(layoutSo)

	// HOOKs
	const [textFind, setTextFind] = useState(strMsgSa.textSearch ?? "")

	useEffect(() => {
		strMsgSo.fetchIfVoid()
	}, [])

	// Load cached format when stream info changes
	useEffect(() => {
		if (strMsgSa.connectionId && strMsgSa.stream?.config?.name) {
			const cachedFormat = getStreamFormat(strMsgSa.connectionId, strMsgSa.stream.config.name)
			if (cachedFormat && strMsgSa.format !== cachedFormat) {
				strMsgSo.setFormat(cachedFormat)
			}
		}
	}, [strMsgSa.connectionId, strMsgSa.stream?.config?.name, strMsgSa.format])

	// HANDLER
	const handleFilterClick = (e: React.MouseEvent, select: boolean) => strMsgSo.setFiltersOpen(!select)
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
	const inLoading = strMsgSa.loadingState == LOAD_STATE.LOADING

	const storeMsg = (strMsgSo.state.linked as MessageStore)
	const selectedIndex = useMemo(() => {
		if (!!messages && storeMsg?.state.type == DOC_TYPE.MESSAGE && !!storeMsg.state.message) {
			return messages.findIndex(m => m.seqNum == storeMsg.state.message.seqNum)
		}
		return null
	}, [storeMsg?.state?.message?.seqNum])
	const clsCard = layoutSo.state.theme == "redeye" ? clsCardRedeye : clsCardBoring


	return <FrameworkCard
		className={clsCard.root}
		icon={<MessageIcon />}
		store={strMsgSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={strMsgSo}
			/>
			<FindInputHeader
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
			selectedIndex={selectedIndex}
			format={strMsgSa.format}
			onLoading={handleLoad}
			onMessageClick={hendleMessageClick}
			onMessageDelete={hendleMessageDelete}
			style={{ marginLeft: '-10px', marginRight: '-10px' }}
			header={<TitleLoading inLoading={inLoading} label="LOAD PREVIOUS ONES" onClick={() => handleLoad(false)} />}
			footer={<TitleLoading divider={DIVIDER_VARIANT.BORDER_DOWN} inLoading={inLoading} label="LOAD MOST RECENT" onClick={() => handleLoad(true)} />}
		/>

		<FilterDialog store={strMsgSo} />

		<FormatDialog store={strMsgSo} />

		<AlertDialog store={strMsgSo} />

	</FrameworkCard>
}

export default StreamMessagesView


const TitleLoading = ({ divider = undefined, inLoading, label, onClick }) => <DividerRow
	variant={divider}
	title={
		<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
			{inLoading
				? <CircularLoadingCmp style={{ width: 14, height: 14 }} />
				: (divider == DIVIDER_VARIANT.BORDER_DOWN ? <ArrowDownIcon /> : <ArrowUpIcon />)
			}
			{label}
		</div>
	}
	onClick={onClick}
/>