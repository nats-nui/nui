import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import ValueCmp from "@/components/stacks/connections/metrics/ValueCmp"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import MetricsIcon from "@/icons/cards/MetricsIcon"
import { CnnMetricsStore } from "@/stores/stacks/connection/metrics"
import { TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import clsCard from "../../CardGreenDef.module.css"
import metricsSo from "@/stores/connections/metrics"



interface Props {
	store?: CnnMetricsStore
}

const CnnMetricsView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store.state.group)
	useStore(metricsSo)
	useStore(store)

	// HOOKs

	// HANDLER
	const handleClientsClick = () => store.openClients()

	// RENDER
	const isClientsOpen = store.getClientOpen()
	const metrics = metricsSo.state.all[store.state.connectionId]?.last
	const varz = metrics?.varz

	return <FrameworkCard
		className={clsCard.root}
		icon={<MetricsIcon />}
		store={store}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
				<LinkButton
					className="jack-focus-1"
					icon={<MessagesIcon />}
					tooltip="CLIENTS"
				// selected={isMessageOpen}
				// onClick={handleMessagesClick}
				// renderExtra={ButtonSend}
				/>
			</div>
		}
		actionsRender={<div />}
	>
		<RowButton style={{ marginBottom: 15 }}
			className="jack-focus-1"
			icon={<MessagesIcon className="small-icon" />}
			label="CLIENTS"
			selected={isClientsOpen}
			onClick={handleClientsClick}
		/>

		<TitleAccordion title="SERVER" style={{ marginBottom: 15 }}>

			<div style={{ display: "flex", marginTop: 10, gap: 15 }}>
				<ValueCmp style={{ flex: 1 }}
					label="CPU" 
					value={varz?.cpu ?? "--"} 
					unit="%" 
					decimals={2}
				/>
				<div className="lbl-divider-vl" />
				<ValueCmp style={{ flex: 1 }}
					label="MEMORY" 
					value={varz?.mem ?? "--"} 
					unit="MiB" 
				/>
				{/* <div className="lbl-divider-vl" />
				<ValueCmp style={{ flex: 1 }}
					label="CONNECTIONS" 
					value={varz?.connections ?? "--"} 
				/> */}
			</div>

			<div className="jack-lbl-prop">SEND</div>

			<div style={{ display: "flex", gap: 15 }}>
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp label="MESSAGE" value={varz?.out_msgs} unit="" />
					<ValueCmp label="RATE" value={"???"} unit="/s" />
				</div>
				<div className="lbl-divider-vl" />
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp label="DATA" value={varz?.out_bytes} unit="" />
					<ValueCmp label="RATE" value={"???"} unit="/s" />
				</div>
			</div>

			<div className="jack-lbl-prop">RECEIVE</div>

			<div style={{ display: "flex", gap: 15 }}>
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp label="MESSAGE" value={varz?.in_msgs} unit="" />
					<ValueCmp label="RATE" value={"???"} unit="/s" />
				</div>
				<div className="lbl-divider-vl" />
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp label="DATA" value={varz?.in_bytes} unit="" />
					<ValueCmp label="RATE" value={"???"} unit="/s" />
				</div>
			</div>


		</TitleAccordion>


		<TitleAccordion title="CONNECTIONS" style={{ marginBottom: 15 }}>
			<div style={{ display: "flex", marginTop: 10 }}>
				<ValueCmp style={{ flex: 1 }} label="TOTAL" value={varz?.connections ?? "--"} />
				<ValueCmp style={{ flex: 1 }} label="SUBSCRIPTION" value={varz?.subscriptions ?? "--"} unit="MiB" />
				<ValueCmp style={{ flex: 1 }} label="SLOW" value={varz?.slow_consumers} unit="MiB" />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="MAX.CONNECTIONS" value={varz?.max_connections ?? "--"} unit="%" />
				<ValueCmp style={{ flex: 1 }} label="MAX.PAYLOAD" value={varz?.max_payload ?? "--"} unit="MiB" />
				<ValueCmp style={{ flex: 1 }} label="MAX.PENDING" value={varz?.max_pending ?? "--"} unit="MiB" />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="WRITE DEADLINE" value={varz?.write_deadline ?? "--"} unit="%" />
				<ValueCmp style={{ flex: 1 }} label="AUTH.TIMEOUT" value={varz?.auth_timeout ?? "--"} unit="MiB" />
				<ValueCmp style={{ flex: 1 }} label="TLS TIMEOUT" value={varz?.tls_timeout ?? "--"} unit="MiB" />
			</div>
		</TitleAccordion>

	</FrameworkCard>
}

export default CnnMetricsView
