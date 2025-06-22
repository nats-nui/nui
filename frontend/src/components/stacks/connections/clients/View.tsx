import FrameworkCard from "@/components/cards/FrameworkCard"
import MetricsIcon from "@/icons/cards/MetricsIcon"
import metricsSo from "@/stores/connections/metrics"
import { ClientMetricsStore } from "@/stores/stacks/connection/clients"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import clsCard from "../../CardPurpleDef.module.css"
import ClientRow from "./ClientRow"
import ClientsActions from "./ClientsAction"



interface Props {
	store?: ClientMetricsStore
}

const ClientMetricsView: FunctionComponent<Props> = ({
	store: store,
}) => {

	// STORE
	useStore(store.state.group)
	useStore(metricsSo)
	useStore(store)

	// HOOKs

	// HANDLER

	// RENDER
	const metrics = metricsSo.state.all[store.state.connectionId]?.last
	const connz = metrics?.connz
	const isVoid = !(metrics?.connz?.connections?.length > 0)
	


	return <FrameworkCard
		className={clsCard.root}
		icon={<MetricsIcon />}
		store={store}
		actionsRender={<ClientsActions store={store} />}
	>
		{!isVoid ? connz.connections.map((cnn, index) => (
			<ClientRow key={cnn.cid} cnn={cnn} />
		)) : (
			<div className="jack-lbl-empty">There are currently no clients connected</div>
		)}
	</FrameworkCard>
}

export default ClientMetricsView
