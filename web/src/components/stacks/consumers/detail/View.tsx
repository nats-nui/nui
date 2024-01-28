import FrameworkCard from "@/components/FrameworkCard"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ShowForm from "./ShowForm"



interface Props {
	store?: ConsumerStore
}

const ConsumerDetailView: FunctionComponent<Props> = ({
	store: consumerSo,
}) => {

	// STORE
	const consumerSa = useStore(consumerSo)

	// HOOKs
	useEffect(() => {
		consumerSo.fetch()
	}, [])
	
	// HANDLER

	// RENDER
	const variant = consumerSa.colorVar

	return <FrameworkCard
		variantBg={variant}
		store={consumerSo}
	>
		<ShowForm store={consumerSo} />
	</FrameworkCard>
}

export default ConsumerDetailView
