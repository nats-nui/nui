import FrameworkCard from "@/components/cards/FrameworkCard"
import FindInputHeader from "@/components/input/FindInputHeader"
import OptionsCmp from "@/components/loaders/OptionsCmp"
import Table from "@/components/table"
import { ConsumersStore } from "@/stores/stacks/consumer"
import { StreamConsumer } from "@/types/Consumer"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import { ConsumerStore } from "../../../stores/stacks/consumer/detail"
import { DOC_TYPE, EDIT_STATE } from "../../../types"
import Button from "../../buttons/Button"
import AlertDialog from "../../dialogs/AlertDialog"



interface Props {
	store?: ConsumersStore
}

const ConsumersListView: FunctionComponent<Props> = ({
	store: consumersSo,
}) => {

	// STORE
	const consumersSa = useStore(consumersSo)
	useStore(consumersSo.state.group)

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

	return <FrameworkCard styleBody={{ padding: 0 }}
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
