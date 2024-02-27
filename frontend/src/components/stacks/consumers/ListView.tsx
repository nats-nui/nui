import FrameworkCard from "@/components/cards/FrameworkCard"
import FindInput from "@/components/input/FindInput"
import Table from "@/components/table"
import docSo from "@/stores/docs"
import { ConsumersStore } from "@/stores/stacks/consumer"
import { StreamConsumer } from "@/types/Consumer"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: ConsumersStore
}

const ConsumersListView: FunctionComponent<Props> = ({
	store: consumersSo,
}) => {

	// STORE
	const consumersSa = useStore(consumersSo)
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		consumersSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (index: number) => consumersSo.select(consumers[index].name)

	// RENDER
	const consumers = consumersSo.getFiltered() ?? []
	const selectedIndex = consumersSo.getIndexByName(consumersSa.select)
	const variant = consumersSa.colorVar
	
	return <FrameworkCard
		store={consumersSo}
		actionsRender={<>
			<FindInput
				value={consumersSa.textSearch}
				onChange={text => consumersSo.setTextSearch(text)}
			/>
		</>}
	>
		<Table
			items={consumers}
			props={[
				{ label: "ACK PENDING", getValue: item => item.numAckPending },
				{ label: "REDELIVERED", getValue: item => item.numRedelivered },
				{ label: "WAITING", getValue: item => item.numWaiting },
				{ label: "PENDING", getValue: item => item.numPending },
			]}
			propMain={{ getValue: (item:StreamConsumer) => item.name }}
			select={selectedIndex}
			onSelectChange={handleSelect}
			variant={variant}
		/>
	</FrameworkCard>
}

export default ConsumersListView
