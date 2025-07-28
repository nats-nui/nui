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
	const messageReceiveRate = compactNumber(varz?.nui_in_msgs_sec)
	const messageSend = compactNumber(varz?.out_msgs)
	const messageSendRate = compactNumber(varz?.nui_out_msgs_sec)
	// ------



	const totalConnections = compactNumber(varz?.total_connections)
	const substriptions = compactNumber(varz?.subscriptions)

	const maxConnections = compactNumber(varz?.max_connections)
	const maxPayload = compactByte(varz?.max_payload)
	const maxPending = compactByte(varz?.max_pending)

	const writeDeadline = nsToValue(varz?.write_deadline, TIME.SECONDS)

	const pingInterval = nsToValue(varz?.ping_interval, TIME.SECONDS)
	const maxControlLine = compactByte(varz?.max_control_line)

	const slowConsumers = compactNumber(varz?.slow_consumers)

	return <FrameworkCard
		className={clsCard.root}
		icon={<MetricsIcon />}
		store={store}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
				<LinkButton
					className="jack-focus-1"
					icon={<MetricClientIcon />}
					tooltip="CLIENTS"
					selected={isClientsOpen}
					onClick={handleClientsClick}
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

		<TitleAccordion title="GENERAL" style={{ marginBottom: 15 }}>

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
				<div style={{ flex: 1, fontSize: 18, fontWeight: 700 }}>IN</div>
				<div style={{ flex: 1, fontSize: 18, fontWeight: 700 }}>OUT</div>
			</div>

			<div style={{ display: "flex", gap: 20 }}>
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp style={{ flex: 1 }}
						label="MESSAGES"
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
						label="MESSAGES"
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

			<div style={{ display: "flex" }}>
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

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="SLOW CONSUMERS" value={slowConsumers.value} unit={slowConsumers.unit} />
				<ValueCmp style={{ flex: 2 }} label="MAX SUBSCRIPTIONS" value={compactNumber(varz?.max_subscriptions).value} unit={compactNumber(varz?.max_subscriptions).unit} />
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

		<TitleAccordion title="SERVER" open={false} style={{ marginBottom: 15 }}>
			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="HOST" value={varz?.host} />
				<ValueCmp style={{ flex: 1 }} label="PORT" value={varz?.port} />
				<ValueCmp style={{ flex: 1 }} label="CORES" value={varz?.cores} />

			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 2 }} label="UPTIME" value={varz?.uptime} />
				<ValueCmp style={{ flex: 1 }} label="VERSION" value={varz?.version} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="GOMAXPROCS" value={varz?.gomaxprocs} />
				<ValueCmp style={{ flex: 1 }} label="GO VERSION" value={varz?.go} />
				<ValueCmp style={{ flex: 1 }} label="PROTOC.V." value={varz?.proto} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="SYSTEM ACCOUNT" value={varz?.system_account} />
				<ValueCmp style={{ flex: 1 }} label="AUTH REQUIRED" value={varz?.auth_required} />
				<ValueCmp style={{ flex: 1 }} label="GIT COMMIT" value={varz?.git_commit} />
			</div>

			<ValueCmp style={{ flex: 60 }} label="SERVER NAME" value={varz?.server_name}
				valueSty={{ fontSize: "14px" }}
			/>
			<ValueCmp style={{ flex: 1 }} label="SERVER ID" value={varz?.server_id}
				valueSty={{ fontSize: "14px" }}
			/>
			<ValueCmp style={{ flex: 1 }} label="CONFIG DIGEST" value={varz?.config_digest}
				valueSty={{ fontSize: "14px" }}
			/>

		</TitleAccordion>

		<TitleAccordion title="HTTP" open={false} style={{ marginBottom: 15 }}>
			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="HTTP HOST" value={varz?.http_host} />
				<ValueCmp style={{ flex: 1 }} label="HTTP PORT" value={varz?.http_port} />
				<ValueCmp style={{ flex: 1 }} label="HTTPS PORT" value={varz?.https_port} />
			</div>
			<ValueCmp style={{ flex: 1 }} label="HTTP BASE PATH" value={varz?.http_base_path} />
		</TitleAccordion>

		<TitleAccordion title="LEAF NODE" open={false} style={{ marginBottom: 15 }}>
			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 2 }} label="HOST" value={varz?.leaf?.host} />
				<ValueCmp style={{ flex: 1 }} label="PORT" value={varz?.leaf?.port} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="AUTH TIMEOUT" value={varz?.leaf?.auth_timeout} />
				<ValueCmp style={{ flex: 1 }} label="TLS REQUIRED" value={varz?.leaf?.tls_required} />
				<ValueCmp style={{ flex: 1 }} label="TLS TIMEOUT" value={varz?.leaf?.tls_timeout} />
			</div>
		</TitleAccordion>

		<TitleAccordion title="MQTT" open={false} style={{ marginBottom: 15 }}>
			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="HOST" value={varz?.mqtt?.host} />
				<ValueCmp style={{ flex: 1 }} label="PORT" value={varz?.mqtt?.port} />
				<ValueCmp style={{ flex: 1 }} label="NO AUTH USER" value={varz?.mqtt?.no_auth_user} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="ACK WAIT" value={nsToValue(varz?.mqtt?.ack_wait, TIME.SECONDS)} unit="s" />
				<ValueCmp style={{ flex: 1 }} label="MAX ACK PENDING" value={varz?.mqtt?.max_ack_pending} />
				<ValueCmp style={{ flex: 1 }} label="TLS TIMEOUT" value={varz?.mqtt?.tls_timeout} unit="s" />
			</div>
		</TitleAccordion>

		<TitleAccordion title="WEBSOCKET" open={false} style={{ marginBottom: 15 }}>
			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="HOST" value={varz?.websocket?.host} />
				<ValueCmp style={{ flex: 1 }} label="PORT" value={varz?.websocket?.port} />
				<ValueCmp style={{ flex: 1 }} label="NO AUTH USER" value={varz?.websocket?.no_auth_user} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="COMPRESSION" value={varz?.websocket?.compression} />
				<ValueCmp style={{ flex: 2 }} label="HANDSHAKE TIMEOUT" value={nsToValue(varz?.websocket?.handshake_timeout, TIME.SECONDS)} unit="s" />
			</div>
		</TitleAccordion>

		<TitleAccordion title="JETSTREAM" open={false} style={{ marginBottom: 15 }}>
			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="ACCOUNTS" value={varz?.jetstream?.stats?.accounts} />
				<ValueCmp style={{ flex: 1 }} label="HA ASSETS" value={varz?.jetstream?.stats?.ha_assets} />
				<ValueCmp style={{ flex: 1 }} label="SYNC INTERVAL" value={nsToValue(varz?.jetstream?.config?.sync_interval, TIME.SECONDS)} unit="s" />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="API TOTAL" value={compactNumber(varz?.jetstream?.stats?.api?.total).value} unit={compactNumber(varz?.jetstream?.stats?.api?.total).unit} />
				<ValueCmp style={{ flex: 1 }} label="API ERRORS" value={compactNumber(varz?.jetstream?.stats?.api?.errors).value} unit={compactNumber(varz?.jetstream?.stats?.api?.errors).unit} />
				<ValueCmp style={{ flex: 1 }} label="COMPRESS OK" value={varz?.jetstream?.config?.compress_ok} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="MEMORY" value={compactByte(varz?.jetstream?.stats?.memory).value} unit={compactByte(varz?.jetstream?.stats?.memory).unit} />
				<ValueCmp style={{ flex: 1 }} label="RESERVED MEMORY" value={compactByte(varz?.jetstream?.stats?.reserved_memory).value} unit={compactByte(varz?.jetstream?.stats?.reserved_memory).unit} />
				<ValueCmp style={{ flex: 1 }} label="MAX MEMORY" value={compactByte(varz?.jetstream?.config?.max_memory).value} unit={compactByte(varz?.jetstream?.config?.max_memory).unit} />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="STORAGE" value={compactByte(varz?.jetstream?.stats?.storage).value} unit={compactByte(varz?.jetstream?.stats?.storage).unit} />
				<ValueCmp style={{ flex: 1 }} label="RESERVED STORAGE" value={compactByte(varz?.jetstream?.stats?.reserved_storage).value} unit={compactByte(varz?.jetstream?.stats?.reserved_storage).unit} />
				<ValueCmp style={{ flex: 1 }} label="MAX STORAGE" value={compactByte(varz?.jetstream?.config?.max_storage).value} unit={compactByte(varz?.jetstream?.config?.max_storage).unit} />
			</div>

			<ValueCmp style={{ flex: 1 }} label="STORE DIR" value={varz?.jetstream?.config?.store_dir}
				valueSty={{ fontSize: "14px" }}
			/>

		</TitleAccordion>

	</FrameworkCard>
}

export default CnnMetricsView
