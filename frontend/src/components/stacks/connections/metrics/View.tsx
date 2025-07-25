import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import ValueCmp from "@/components/stacks/connections/metrics/ValueCmp"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import MetricsIcon from "@/icons/cards/MetricsIcon"
import metricsSo from "@/stores/connections/metrics"
import { CnnMetricsStore } from "@/stores/stacks/connection/metrics"
import { compactByte, compactNumber, nsToValue, TIME } from "@/utils/conversion"
import { MESSAGE_TYPE, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import clsCard from "../../CardPurple.module.css"
import MetricClientIcon from "@/icons/cards/MetricClientIcon"



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

	// ------
	const dataReceive = compactByte(varz?.in_bytes)
	const dataReceiveRate = compactByte(varz?.nui_in_bytes_sec)
	const dataSend = compactByte(varz?.out_bytes)
	const dataSendRate = compactByte(varz?.nui_out_bytes_sec)

	const messageReceive = compactNumber(varz?.in_msgs)
	const messageReceiveRate = compactByte(varz?.nui_in_msgs_sec)
	const messageSend = compactNumber(varz?.out_msgs)
	const messageSendRate = compactByte(varz?.nui_out_msgs_sec)
	// ------



	const totalConnections = compactNumber(varz?.total_connections)
	const substriptions = compactNumber(varz?.subscriptions)

	const maxConnections = compactNumber(varz?.max_connections)
	const maxPayload = compactByte(varz?.max_payload)
	const maxPending = compactByte(varz?.max_pending)

	const writeDeadline = nsToValue(varz?.write_deadline, TIME.SECONDS)

	const pingInterval = nsToValue(varz?.ping_interval, TIME.SECONDS)
	const maxControlLine = compactByte(varz?.max_control_line)

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
			icon={<MetricClientIcon className="small-icon" />}
			label="CLIENTS"
			selected={isClientsOpen}
			onClick={handleClientsClick}
		/>

		<TitleAccordion title="SERVER" style={{ marginBottom: 15 }}>

			<div style={{ display: "flex", marginTop: 10, gap: 15 }}>
				<ValueCmp style={{ flex: 1 }}
					label="CPU"
					value={varz?.cpu}
					unit="%"
					decimals={2}
				/>
				<ValueCmp style={{ flex: 1 }}
					label="MEMORY"
					value={memory.value}
					unit={memory.unit}
				/>
			</div>
			

			<div style={{ display: "flex", gap: 20 }}>
				<div style={{ flex: 1 }} className="jack-lbl-prop">RECEIVE</div>
				<div style={{ flex: 1 }} className="jack-lbl-prop">SEND</div>
			</div>

			<div style={{ display: "flex", gap: 20, marginTop: -5 }}>

				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="DATA"
						value={dataReceive.value}
						unit={dataReceive.unit}
						decimals={1}
					/>
					<ValueCmp style={{ flex: 1 }}
						label="RATE"
						value={dataReceiveRate.value}
						unit={`${dataReceiveRate.unit}/s`}
						decimals={1}
					/>
				</div>

				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="DATA"
						value={dataSend.value}
						unit={dataSend.unit}
						decimals={1}
					/>
					<ValueCmp style={{ flex: 1 }}
						label="RATE"
						value={dataSendRate.value}
						unit={`${dataSendRate.unit}/s`}
						decimals={1}
					/>
				</div>

			</div>

			<div style={{ display: "flex", gap: 20 }}>
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="MESSAGE"
						value={messageReceive.value}
						unit={messageReceive.unit}
						decimals={1}
					/>
					<ValueCmp style={{ flex: 1 }}
						label="RATE"
						value={messageReceiveRate.value}
						unit={`${messageReceiveRate.unit}/s`}
						decimals={1}
					/>
				</div>

				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="MESSAGE"
						value={messageSend.value}
						unit={messageSend.unit}
						decimals={1}
					/>
					<ValueCmp style={{ flex: 1 }}
						label="RATE"
						value={messageSendRate.value}
						unit={`${messageSendRate.unit}/s`}
						decimals={1}
					/>
				</div>
			</div>



		</TitleAccordion>


		<TitleAccordion title="CONNECTIONS" style={{ marginBottom: 15 }}>

			<div style={{ display: "flex", marginTop: 10 }}>
				<ValueCmp style={{ flex: 1 }} label="CONNECTIONS" value={varz?.connections} />
				<ValueCmp style={{ flex: 1 }} label="TOTAL CONN." value={totalConnections.value} unit={totalConnections.unit} />
				<ValueCmp style={{ flex: 1 }} label="MAX CONN." value={maxConnections.value} unit={maxConnections.unit} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="LEAF NODES" value={varz?.leafnodes} />
				<ValueCmp style={{ flex: 1 }} label="ROUTES" value={varz?.routes} />
				<ValueCmp style={{ flex: 1 }} label="REMOTES" value={varz?.remotes} />
			</div>

			<div style={{ display: "flex", marginTop: 10 }}>
				<ValueCmp style={{ flex: 1 }} label="SUBSCRIPTIONS" value={substriptions.value} unit={substriptions.unit} />
				<ValueCmp style={{ flex: 1 }} label="MAX.PAYLOAD" value={maxPayload.value} unit={maxPayload.unit} />
				<ValueCmp style={{ flex: 1 }} label="MAX.PENDING" value={maxPending.value} unit={maxPending.unit} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="WRITE DEADLINE" value={writeDeadline} unit="s" />
				<ValueCmp style={{ flex: 1 }} label="AUTH.TIMEOUT" value={varz?.auth_timeout} unit="s" />
				<ValueCmp style={{ flex: 1 }} label="TLS TIMEOUT" value={varz?.tls_timeout} unit="s" />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="MAX CONTROL LINE" {...maxControlLine} />
				<ValueCmp style={{ flex: 1 }} label="PING INTERVAL" value={pingInterval} unit="s" />
				<ValueCmp style={{ flex: 1 }} label="MAX PING OUT" value={varz?.ping_max} />
			</div>

		</TitleAccordion>

		<TitleAccordion title="SLOW CONSUMER" style={{ marginBottom: 15 }}>
			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="CLIENTS" value={varz?.slow_consumer_stats?.clients} />
				<ValueCmp style={{ flex: 1 }} label="ROUTES" value={varz?.slow_consumer_stats?.routes} />
				<ValueCmp style={{ flex: 1 }} label="GATEWAYS" value={varz?.slow_consumer_stats?.gateways} />
				<ValueCmp style={{ flex: 1 }} label="LEAFS" value={varz?.slow_consumer_stats?.leafs} />
			</div>
		</TitleAccordion>

		<TitleAccordion title="LEAF NODE" style={{ marginBottom: 15 }}>
			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="HOST" value={varz?.leaf?.host} />
				<ValueCmp style={{ flex: 1 }} label="PORT" value={varz?.leaf?.port} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="AUTH TIMEOUT" value={varz?.leaf?.auth_timeout} />
				<ValueCmp style={{ flex: 1 }} label="TLS REQUIRED" value={varz?.leaf?.tls_required} />
				<ValueCmp style={{ flex: 1 }} label="TLS TIMEOUT" value={varz?.leaf?.tls_timeout} />
			</div>
		</TitleAccordion>

	</FrameworkCard>
}

export default CnnMetricsView
