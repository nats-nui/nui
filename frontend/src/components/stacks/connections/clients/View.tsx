import FrameworkCard from "@/components/cards/FrameworkCard"
import MetricsIcon from "@/icons/cards/MetricsIcon"
import { ClientMetricsStore } from "@/stores/stacks/connection/clients"
import { TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import clsCard from "../../CardGreenDef.module.css"
import metricsSo from "@/stores/connections/metrics"



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
		actionsRender={<div />}
	>
		{!isVoid ? connz.connections.map((cnn, index) => (
			<div key={cnn.cid} style={{ 
				padding: "8px", 
				marginBottom: "8px", 
				border: "1px solid #333", 
				borderRadius: "4px",
				backgroundColor: "#1a1a1a"
			}}>
				<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
					<strong>Client {cnn.cid}</strong>
					<span style={{ color: "#888" }}>{cnn.type}</span>
				</div>
				<div style={{ fontSize: "0.9em", color: "#ccc" }}>
					<div>IP: {cnn.ip}:{cnn.port}</div>
					<div>Uptime: {cnn.uptime}</div>
					<div>Messages: In {cnn.in_msgs} / Out {cnn.out_msgs}</div>
					<div>Bytes: In {cnn.in_bytes} / Out {cnn.out_bytes}</div>
					<div>Subscriptions: {cnn.subscriptions}</div>
					{cnn.name && <div>Name: {cnn.name}</div>}
					{cnn.lang && <div>Language: {cnn.lang}</div>}
					{cnn.version && <div>Version: {cnn.version}</div>}
				</div>
			</div>
		)) : (
			<div className="jack-lbl-empty">There are currently no clients connected</div>
		)}
	</FrameworkCard>
}

export default ClientMetricsView
