import FrameworkCard from "@/components/cards/FrameworkCard"
import { ConsumersStore } from "@/stores/stacks/consumer"
import { StreamConsumer } from "@/types/Consumer"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ConsumersIcon from "../../../icons/cards/ConsumersIcon"
import { ConsumerStore } from "../../../stores/stacks/consumer/detail"
import { DOC_TYPE, EDIT_STATE } from "../../../types"
import clsCardRedeye from "../CardFuchsiaDef.module.css"
import clsCardBoring from "../CardBoringDef.module.css"
import { AlertDialog, Button, FindInputHeader, OptionsCmp, Table } from "@priolo/jack"
import layoutSo from "@/stores/layout"



interface Props {
	store?: ConsumersStore
}

const ConsumersListView: FunctionComponent<Props> = ({
	store: consumersSo,
}) => {

	// STORE
	const consumersSa = useStore(consumersSo)
	useStore(consumersSo.state.group)
	useStore(layoutSo)

	// HOOKs
	useEffect(() => {
		consumersSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (consumer: StreamConsumer) => consumersSo.select(consumer.name)
	const handleNew = () => consumersSo.create()
	const handleDelete = () => consumersSo.delete()

	// RENDER
	const consumers = consumersSo.getFiltered() ?? []
	const selected = consumersSa.select
	const isNewSelect = consumersSa.linked?.state.type == DOC_TYPE.CONSUMER && (consumersSa.linked as ConsumerStore).state.editState == EDIT_STATE.NEW
	const clsCard = layoutSo.state.theme == "redeye" ? clsCardRedeye : clsCardBoring

	return <FrameworkCard
		className={clsCard.root}
		icon={<ConsumersIcon />}
		styleBody={{ padding: 0 }}
		store={consumersSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={consumersSo}
			/>
			<FindInputHeader
				value={consumersSa.textSearch}
				onChange={text => consumersSo.setTextSearch(text)}
			/>
			{!!selected && <Button
				children="DELETE"
				onClick={handleDelete}
			/>}
			{!!selected && <div> | </div>}
			<Button
				children="NEW"
				select={isNewSelect}
				onClick={handleNew}
			/>
		</>}
	>
		<Table
			items={consumers}
			props={[
				{ label: "NAME", getValue: (item: StreamConsumer) => item.name, isMain: true },
				{ label: "ACK", getValue: item => item.numAckPending },
				{ label: "REDELIVERED", getValue: item => item.numRedelivered },
				{ label: "WAITING", getValue: item => item.numWaiting },
				{ label: "PENDING", getValue: item => item.numPending },
			]}
			selectId={selected}
			onSelectChange={handleSelect}
			getId={(consumer: StreamConsumer) => consumer.name}
			singleRow={consumersSo.getWidth() > 430}
		/>

		<AlertDialog store={consumersSo} />

	</FrameworkCard>
}

export default ConsumersListView
