import FrameworkCard from "@/components/FrameworkCard"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: ConsumerStore
}

const ConsumerDetailView: FunctionComponent<Props> = ({
	store: consumerSo,
}) => {

	// STORE
	const consumerSa = useStore(consumerSo)

	// HOOKs

	// HANDLER

	// RENDER
	const variant = consumerSa.colorVar

	return <FrameworkCard
		variantBg={variant}
		store={consumerSo}
	>
		CIAO
	</FrameworkCard>
}

export default ConsumerDetailView
