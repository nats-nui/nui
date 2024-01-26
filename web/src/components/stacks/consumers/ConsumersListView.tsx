import FrameworkCard from "@/components/FrameworkCard"
import ElementRow from "@/components/rows/ElementRow"
import { ConsumersStore } from "@/stores/stacks/consumer"
import { ConsumerInfo } from "@/types/Consumer"
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

	// HOOKs
	useEffect(() => {
		consumersSo.fetch()
	}, [])

	// HANDLER
	const handleSelect = (consumer: ConsumerInfo) => consumersSo.select(consumer.config.name)

	// RENDER
	const consumers = consumersSa.all
	if (!consumers) return null
	const selected = consumersSa.select
	const variant = consumersSo.getColorVar()
	const isSelected = (consumer: ConsumerInfo) => selected == consumer.config?.name
	const getTitle = (consumer: ConsumerInfo) => consumer.config?.name ?? "--"
	//const getSubtitle = (consumer: ConsumerInfo) => consumer.config.description

	return <FrameworkCard
		store={consumersSo}
	>
		{consumers.map(consumer => (
			<ElementRow key={consumer.config.name}
				title={getTitle(consumer)}
				//subtitle={getSubtitle(consumer)}
				selected={isSelected(consumer)}
				variant={variant}
				onClick={() => handleSelect(consumer)}
			/>
		))}
	</FrameworkCard>
}

export default ConsumersListView
