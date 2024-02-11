import FrameworkCard from "@/components/FrameworkCard"
import ElementRow from "@/components/rows/ElementRow"
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
	const handleSelect = (consumer: StreamConsumer) => consumersSo.select(consumer.config.name)

	// RENDER
	const consumers = consumersSa.all
	if (!consumers) return null
	const selected = consumersSa.select
	const variant = consumersSa.colorVar
	const isSelected = (consumer: StreamConsumer) => selected == consumer.config?.name
	const getTitle = (consumer: StreamConsumer) => consumer.config?.name ?? "--"
	
	return <FrameworkCard
		store={consumersSo}
	>
		{consumers.map(consumer => (
			<ElementRow key={consumer.config.name}
				title={getTitle(consumer)}
				selected={isSelected(consumer)}
				variant={variant}
				onClick={() => handleSelect(consumer)}
			/>
		))}
	</FrameworkCard>
}

export default ConsumersListView
