import FrameworkCard from "@/components/cards/FrameworkCard"
import MetricsIcon from "@/icons/cards/MetricsIcon"
import metricsSo from "@/stores/connections/metrics"
import { ClientMetricsStore } from "@/stores/stacks/connection/clients"
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
		if (text.length == 0) return connz.connections
		const clients = text.length < 3
			? connz.connections
			: connz.connections.filter(cnn => {
				if (cnn.cid.toString().includes(text)) return true
				if (!!cnn.name && cnn.name.toLowerCase().includes(text)) return true
				
				return false
			})
		return clients
		//connz.connections.sort((a, b) => a.cid.localeCompare(b.cid))
	}, [connz, store.state.textSearch, store.state.sort])

	// HANDLER

	// RENDER
	const isVoid = !clients || clients.length == 0

	return <FrameworkCard
		className={clsCard.root}
		icon={<MetricsIcon />}
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
