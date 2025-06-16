import FrameworkCard from "@/components/cards/FrameworkCard"
import MetricsIcon from "@/icons/cards/MetricsIcon"
import { ClientMetricsStore } from "@/stores/stacks/connection/clients"
import { TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import clsCard from "../../CardGreenDef.module.css"



interface Props {
	store?: ClientMetricsStore
}

const ClientMetricsView: FunctionComponent<Props> = ({
	store: store,
}) => {

	// STORE
	useStore(store.state.group)
	useStore(store)

	// HOOKs

	// HANDLER

	// RENDER

	return <FrameworkCard
		className={clsCard.root}
		icon={<MetricsIcon />}
		store={store}
		actionsRender={<div />}
	>
		

		<TitleAccordion title="SERVER" style={{ marginBottom: 15 }}>

			CIAO

		</TitleAccordion>


	</FrameworkCard>
}

export default ClientMetricsView
