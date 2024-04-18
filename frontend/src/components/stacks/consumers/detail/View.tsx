import FrameworkCard from "@/components/cards/FrameworkCard"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ShowForm from "./ShowForm"
import OptionsCmp from "@/components/loaders/OptionsCmp"



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
		consumerSo.fetchIfVoid()
	}, [])

	// HANDLER

	// RENDER
	return <FrameworkCard variantBg
		store={consumerSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5 }}
				store={consumerSo}
			/>
			<div style={{ flex: 1 }} />
		</>
		}
	>
		<ShowForm store={consumerSo} />
	</FrameworkCard>
}

export default ConsumerDetailView
