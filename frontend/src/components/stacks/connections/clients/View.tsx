import FrameworkCard from "@/components/cards/FrameworkCard"
import MetricClientIcon from "@/icons/cards/MetricClientIcon"
import metricsSo from "@/stores/connections/metrics"
import { ClientMetricsStore } from "@/stores/stacks/connection/clients"
import { filterClientsByText, sortClients } from "@/stores/stacks/connection/clients/utils"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import clsCard from "../../CardPurpleDef.module.css"
import ClientRow from "./ClientRow"
import ClientsActions from "./ClientsAction"
import SortDialog from "./SortDialog"



interface Props {
	store?: ClientMetricsStore
}

const ClientMetricsView: FunctionComponent<Props> = ({
	store: store,
}) => {
	const metrics = metricsSo.state.all[store.state.connectionId]?.last
	const connz = metrics?.connz

	// STORE
	useStore(store.state.group)
	useStore(metricsSo)
	useStore(store)

	// HOOKs
	const clients = useMemo(() => {
		if (!connz) return
		const text = store.state.textSearch?.trim().toLowerCase() ?? ""
		let clients = filterClientsByText(connz.connections, text)
		clients = sortClients(clients, store.state.sort, store.state.sortIsDesc)
		return clients
	}, [connz, store.state.textSearch, store.state.sort, store.state.sortIsDesc])

	// HANDLER

	// RENDER
	const isVoid = !clients || clients.length == 0

	return <FrameworkCard
		className={clsCard.root}
		icon={<MetricClientIcon />}
		store={store}
		actionsRender={<ClientsActions store={store} />}
	>
		{!isVoid ? clients.map((cnn) => (
			<ClientRow key={cnn.cid} cnn={cnn} />
		)) : (
			<div className="jack-lbl-empty">There are currently no clients connected</div>
		)}

		<SortDialog store={store} />

	</FrameworkCard>
}

export default ClientMetricsView
