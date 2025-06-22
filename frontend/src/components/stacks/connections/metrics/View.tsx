import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import ValueCmp from "@/components/stacks/connections/metrics/ValueCmp"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import MetricsIcon from "@/icons/cards/MetricsIcon"
import metricsSo from "@/stores/connections/metrics"
import { CnnMetricsStore } from "@/stores/stacks/connection/metrics"
import { MESSAGE_TYPE, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import clsCard from "../../CardBlue.module.css"
import { compactByte, getLargestUnit, compactNumber, nsToValue, TIME } from "@/utils/conversion"



interface Props {
	store?: CnnMetricsStore
}

const CnnMetricsView: FunctionComponent<Props> = ({
	store,
}) => {

	const listener = metricsSo.state.all[store.state.connectionId]

	// STORE
	useStore(store.state.group)
	useStore(metricsSo)
	useStore(store)

	// HOOKs
	useEffect(() => {
		if (!listener?.error) return
		store.setSnackbar({
			open: true,
			title: "ERROR",
			type: MESSAGE_TYPE.ERROR,
			body: listener.error,
		})
	}, [listener?.error])

	// HANDLER
	const handleClientsClick = () => store.openClients()

	// RENDER
	const isClientsOpen = store.getClientOpen()
	const metrics = listener?.last
	const varz = metrics?.varz
	const memory = compactByte(varz?.mem)
	const messageSend = compactNumber(varz?.out_msgs)
	const dataSend = compactByte(varz?.out_bytes)
	const messageReceive = compactNumber(varz?.in_msgs)
	const dataReceive = compactByte(varz?.in_bytes)

	const totalConnections = compactNumber(varz?.total_connections)
	const substriptions = compactNumber(varz?.subscriptions)
	const slowConsumers = compactNumber(varz?.slow_consumers)

	const maxConnections = compactNumber(varz?.max_connections)
	const maxPayload = compactByte(varz?.max_payload)
	const maxPending = compactByte(varz?.max_pending)

	const writeDeadline = nsToValue(varz?.write_deadline, TIME.SECONDS)


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
					value={memory.value ?? "--"}
					unit={memory.unit}
				/>
				{/* <div className="lbl-divider-vl" />
				<ValueCmp style={{ flex: 1 }}
					label="CONNECTIONS" 
					value={varz?.connections ?? "--"} 
				/> */}
			</div>

			<div style={{ display: "flex", gap: 20 }}>
				<div style={{ flex: 1 }} className="jack-lbl-prop">RECEIVE</div>
				<div style={{ flex: 1 }} className="jack-lbl-prop">SEND</div>
			</div>



			<div style={{ display: "flex", gap: 20 }}>

				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="DATA"
						value={dataReceive.value ?? "--"}
						unit={dataReceive.unit}
					/>
					<ValueCmp label="RATE" value={"???"} unit="/s" />
				</div>

				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="DATA"
						value={dataSend.value ?? "--"}
						unit={dataSend.unit}
					/>
					<ValueCmp label="RATE" value={"???"} unit="/s" />
				</div>

			</div>



			<div style={{ display: "flex", gap: 20 }}>
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="MESSAGE"
						value={messageReceive.value ?? "--"}
						unit={messageReceive.unit}
					/>
					<ValueCmp label="RATE" value={"???"} unit="/s" />
				</div>

				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="MESSAGE"
						value={messageSend.value ?? "--"}
						unit={messageSend.unit}
					/>
					<ValueCmp label="RATE" value={"???"} unit="/s" />
				</div>
			</div>


		</TitleAccordion>


		<TitleAccordion title="CONNECTIONS" style={{ marginBottom: 15 }}>
			<div style={{ display: "flex", marginTop: 10 }}>
				<ValueCmp style={{ flex: 1 }} label="TOTAL CONN." value={totalConnections.value ?? "--"} unit={totalConnections.unit} />
				<ValueCmp style={{ flex: 1 }} label="SUBSCRIPTION" value={substriptions.value ?? "--"} unit={substriptions.unit} />
				<ValueCmp style={{ flex: 1 }} label="SLOW CONSUMERS" value={slowConsumers.value} unit={slowConsumers.unit} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="MAX.CONNECTIONS" value={maxConnections.value ?? "--"} unit={maxConnections.unit} />
				<ValueCmp style={{ flex: 1 }} label="MAX.PAYLOAD" value={maxPayload.value ?? "--"} unit={maxPayload.unit} />
				<ValueCmp style={{ flex: 1 }} label="MAX.PENDING" value={maxPending.value ?? "--"} unit={maxPending.unit} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="WRITE DEADLINE" value={writeDeadline ?? "--"} unit={"s"} />
				<ValueCmp style={{ flex: 1 }} label="AUTH.TIMEOUT" value={varz?.auth_timeout ?? "--"} unit="s" />
				<ValueCmp style={{ flex: 1 }} label="TLS TIMEOUT" value={varz?.tls_timeout ?? "--"} unit="s" />
			</div>
		</TitleAccordion>

	</FrameworkCard>
}

export default CnnMetricsView
