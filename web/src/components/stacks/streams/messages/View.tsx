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
	//#region  SUBSCRIPTIONS
	const handleClickSubs = (e: React.MouseEvent, select: boolean) => {
		if (select) return
		strMsgSo.setFiltersOpen(!select)
	}
	const handleCloseSubsDialog = () => {
		strMsgSo.setFiltersOpen(false)
	}
	// const handleChangeSubs = (newSubject: string[]) => {
	// 	strMsgSo.setSubscriptions(newSubs)
	// }
	//#endregion

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
				onClick={handleClickSubs}
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

		<Dialog
			width={200}
			open={strMsgSa.filtersOpen}
			store={strMsgSo}
			onClose={handleCloseSubsDialog}
		>
			<BoxV>
				<Label>SEQUENCE START</Label>
				<NumberInput
					style={{ flex: 1 }}
					value={strMsgSa.startSeq}
					onChange={(value: number) => strMsgSo.setStartSeq(value)}
				/>
			</BoxV>
			<BoxV>
				<Label>INTERVAL</Label>
				<NumberInput
					style={{ flex: 1 }}
					value={strMsgSa.interval}
					onChange={(value: number) => strMsgSo.setInterval(value)}
				/>
			</BoxV>

			{/* <EditList<string>
				items={strMsgSa.subjects}
				onChangeItems={handleChangeSubs}
				fnNewItem={() => ({ subject: "<new>" })}
				RenderRow={EditSubscriptionRow}
			/> */}
		</Dialog>

		<FormatDialog store={strMsgSo} />

	</FrameworkCard>
}

export default StreamMessagesView

