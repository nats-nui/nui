import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import FindInput from "@/components/input/FindInput"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useState } from "react"
import ItemsList from "../../messages/ItemsList"
import Dialog from "@/components/dialogs/Dialog"
import FormatDialog from "../../messages/FormatDialog"
import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"
import NumberInput from "@/components/input/NumberInput"
import List from "@/components/lists/List"
import { Subscription } from "@/types"
import Box from "@/components/format/Box"
import IconToggle from "@/components/buttons/IconToggle"
import DateTimeInput from "@/components/input/DateTimeInput"
import FilterDialog from "./FilterDialog"



interface Props {
	store?: StreamMessagesStore
	style?: React.CSSProperties,
}

const StreamMessagesView: FunctionComponent<Props> = ({
	store: strMsgSo,
	style,
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
		console.log("handleLoad", bottom)
		if (bottom) {
			return await strMsgSo.fetchNext()
		} else {
			return await strMsgSo.fetchPrev()
		}
	}

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
				label={formatSel}
				variant={variant}
				onClick={handleFormatsClick}
			/>
			<Button
				select={strMsgSa.filtersOpen}
				label="FILTERS"
				onClick={handleFilterClick}
				variant={variant}
			/>
		</>}
	>
		<ItemsList
			messages={messages}
			format={strMsgSa.format}
			onLoading={handleLoad}
			//onMessageClick={hendleMessageClick}
			style={{ marginLeft: '-10px', marginRight: '-10px' }}
		/>

		<FilterDialog store={strMsgSo} />

		<FormatDialog store={strMsgSo} />

	</FrameworkCard>
}

export default StreamMessagesView

