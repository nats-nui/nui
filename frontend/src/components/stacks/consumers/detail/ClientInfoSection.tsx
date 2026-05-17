import { socketPool } from "@/plugins/SocketService/pool"
import { MSG_TYPE } from "@/plugins/SocketService/types"
import metricsSo from "@/stores/connections/metrics"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { ConnzConnection } from "@/types/Metrics"
import { compactByte, compactNumber } from "@/utils/conversion"
import { getDeltaTime } from "@/utils/timeUtils"
import { TooltipWrapCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import dayjs from "dayjs"
import { FunctionComponent, useEffect, useState } from "react"


interface Props {
	store: ConsumerStore
}

const PAGE_SIZE = 10

const ClientInfoSection: FunctionComponent<Props> = ({ store }) => {
	const state = useStore(store)
	useStore(metricsSo)

	const [clients, setClients] = useState<ConnzConnection[]>([])
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(0)

	const connectionId = state.connectionId
	const consumer = state.consumer

	useEffect(() => {
		if (!connectionId || !consumer) return

		// Enable metrics to cache connection data
		metricsSo.enable(connectionId)

		// Set up listener for consumer clients response
		const socketId = `global::${connectionId}`
		const ss = socketPool.getById(socketId)
		if (!ss) {
			setError("Socket not available")
			setLoading(false)
			return
		}

		const onConsumerClientsResp = (message: any) => {
			const payload = message.payload
			if (payload.stream_name !== consumer.streamName || payload.consumer_name !== consumer.name) {
				return
			}
			if (payload.error) {
				setError(payload.error)
				setClients([])
			} else {
				setError(null)
				setClients(payload.clients || [])
			}
			setLoading(false)
		}

		ss.emitter.on(MSG_TYPE.CONSUMER_CLIENTS_RESP, onConsumerClientsResp)

		// Request consumer clients
		const requestClients = () => {
			const deliverSubject = consumer.config?.deliverSubject || ""
			const filterSubject = consumer.config?.filterSubject || consumer.config?.filterSubjects?.[0] || ""

			ss.send(JSON.stringify({
				type: MSG_TYPE.CONSUMER_CLIENTS_REQ,
				payload: {
					stream_name: consumer.streamName,
					consumer_name: consumer.name,
					deliver_subject: deliverSubject,
					filter_subject: filterSubject,
				}
			}))
		}

		// Initial request after a short delay to allow metrics to populate
		const initialTimer = setTimeout(requestClients, 1500)

		// Periodic refresh
		const intervalId = setInterval(requestClients, 5000)

		return () => {
			clearTimeout(initialTimer)
			clearInterval(intervalId)
			ss.emitter.off(MSG_TYPE.CONSUMER_CLIENTS_RESP, onConsumerClientsResp)
		}
	}, [connectionId, consumer?.streamName, consumer?.name])

	// Pagination
	const totalPages = Math.ceil(clients.length / PAGE_SIZE)
	const paginatedClients = clients.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

	if (loading) {
		return (
			<div className="jack-lbl-empty">
				Loading client information...
			</div>
		)
	}

	if (error) {
		return (
			<div style={{ color: "var(--color-yellow)" }}>
				{error}
			</div>
		)
	}

	if (clients.length === 0) {
		return (
			<div>
				<div className="jack-lbl-empty">
					No active client connections found for this consumer.
				</div>
				<div style={{ fontSize: 11, color: "var(--color-element-fg)", opacity: 0.5, marginTop: 4 }}>
					Clients are matched by subscription to the consumer's delivery or filter subject.
				</div>
			</div>
		)
	}

	return (
		<div className="lyt-v" style={{ gap: 8 }}>
			{/* Summary */}
			<div style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				marginBottom: 4
			}}>
				<span style={{
					backgroundColor: "var(--cmp-select-bg)",
					color: "var(--cmp-select-fg)",
					padding: "2px 8px",
					borderRadius: 3,
					fontSize: 11,
					fontWeight: 600
				}}>
					{clients.length}
				</span>
				<span style={{ fontSize: 12, opacity: 0.7 }}>
					client{clients.length !== 1 ? 's' : ''} connected
				</span>
			</div>

			{/* Client list */}
			{paginatedClients.map((client) => (
				<ClientCard key={client.cid} client={client} />
			))}

			{/* Pagination */}
			{totalPages > 1 && (
				<div style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					gap: 12,
					marginTop: 8,
					paddingTop: 8,
					borderTop: "1px solid var(--cmp-bg)"
				}}>
					<button
						onClick={() => setPage(p => Math.max(0, p - 1))}
						disabled={page === 0}
						style={{
							padding: "4px 12px",
							backgroundColor: page === 0 ? "var(--cmp-bg)" : "var(--color-element-bg)",
							border: "1px solid var(--cmp-bg)",
							borderRadius: 3,
							color: page === 0 ? "var(--color-element-fg)" : "var(--cmp-select-bg)",
							cursor: page === 0 ? "default" : "pointer",
							opacity: page === 0 ? 0.4 : 1,
							fontSize: 11,
							fontWeight: 500,
						}}
					>
						PREV
					</button>
					<span style={{
						fontSize: 11,
						color: "var(--color-element-fg)",
						opacity: 0.7,
						minWidth: 50,
						textAlign: "center"
					}}>
						{page + 1} / {totalPages}
					</span>
					<button
						onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
						disabled={page >= totalPages - 1}
						style={{
							padding: "4px 12px",
							backgroundColor: page >= totalPages - 1 ? "var(--cmp-bg)" : "var(--color-element-bg)",
							border: "1px solid var(--cmp-bg)",
							borderRadius: 3,
							color: page >= totalPages - 1 ? "var(--color-element-fg)" : "var(--cmp-select-bg)",
							cursor: page >= totalPages - 1 ? "default" : "pointer",
							opacity: page >= totalPages - 1 ? 0.4 : 1,
							fontSize: 11,
							fontWeight: 500,
						}}
					>
						NEXT
					</button>
				</div>
			)}
		</div>
	)
}

export default ClientInfoSection


interface ClientCardProps {
	client: ConnzConnection
}

const ClientCard: FunctionComponent<ClientCardProps> = ({ client }) => {
	const startActivity = dayjs(client.start).format("YYYY-MM-DD HH:mm:ss")
	const lastActivity = dayjs(client.last_activity).format("YYYY-MM-DD HH:mm:ss")
	const [lastActivityDelta, isRecentActivity] = getDeltaTime(client.last_activity)
	const rtt = client.rtt ? (parseInt(client.rtt) + client.rtt?.slice(-2)) : "--"
	const pending = compactByte(client?.pending_bytes)

	const lang = `${client.lang?.toLowerCase() ?? "--"} v${client.version ?? "--"}`

	const msgsIn = compactNumber(client?.in_msgs)
	const msgsInRate = compactNumber(client?.nui_in_msgs_sec)
	const msgsOut = compactNumber(client?.out_msgs)
	const msgsOutRate = compactNumber(client?.nui_out_msgs_sec)

	const bytesOut = compactByte(client?.out_bytes)
	const bytesOutRate = compactByte(client?.nui_out_bytes_sec)
	const bytesIn = compactByte(client?.in_bytes)
	const bytesInRate = compactByte(client?.nui_in_bytes_sec)

	return (
		<div className="jack-lyt-quote" style={{
			padding: 10,
			borderRadius: 4,
			fontSize: 12,
			display: "flex",
			flexDirection: "column",
			gap: 6,
		}}>
			{/* Header: CID, IP:Port, Language badge */}
			<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
				{/* Activity indicator */}
				<div style={{
					width: 8,
					height: 8,
					borderRadius: "50%",
					backgroundColor: isRecentActivity ? "var(--color-mint)" : "var(--cmp-bg)",
					flexShrink: 0,
				}} />

				{/* CID and IP */}
				<div style={{ flex: 1, ...ellipsisStyle }}>
					<span style={{ fontWeight: 700, color: "var(--cmp-select-bg)" }}>{client.cid}</span>
					<span style={{ opacity: 0.5 }}> / </span>
					<span style={{ opacity: 0.8 }}>{client.ip}:{client.port}</span>
				</div>

				{/* Language badge */}
				<div style={{
					backgroundColor: "var(--cmp-select-bg)",
					color: "var(--cmp-select-fg)",
					padding: "2px 6px",
					borderRadius: 3,
					fontSize: 10,
					fontWeight: 600,
					flexShrink: 0,
				}}>
					{lang}
				</div>
			</div>

			{/* Client name */}
			{client.name && (
				<div style={{
					color: "var(--cmp-select-bg)",
					fontSize: 11,
					fontWeight: 500,
					...ellipsisStyle
				}}>
					{client.name}
				</div>
			)}

			{/* Stats Row 1: Time-based metrics */}
			<div style={{
				display: "grid",
				gridTemplateColumns: "repeat(6, 1fr)",
				gap: 4,
				paddingTop: 4,
				borderTop: "1px solid var(--cmp-bg)"
			}}>
				<TooltipWrapCmp content={lastActivity}>
					<StatItem
						label="LAST ACT."
						value={lastActivityDelta}
						highlight={isRecentActivity}
					/>
				</TooltipWrapCmp>
				<TooltipWrapCmp content={startActivity}>
					<StatItem label="START" value={startActivity.split(" ")[1]} />
				</TooltipWrapCmp>
				<StatItem label="UPTIME" value={client.uptime} />
				<StatItem label="RTT" value={rtt} />
				<StatItem label="SUBS." value={client.subscriptions} />
				<StatItem label="PENDING" value={`${pending.value}${pending.unit}`} />
			</div>

			{/* Stats Row 2: Throughput metrics */}
			<div style={{
				display: "grid",
				gridTemplateColumns: "repeat(4, 1fr)",
				gap: 4,
			}}>
				<ThroughputItem label="MESS. IN" value={msgsIn} rate={msgsInRate} />
				<ThroughputItem label="MESS. OUT" value={msgsOut} rate={msgsOutRate} />
				<ThroughputItem label="DATA IN" value={bytesIn} rate={bytesInRate} />
				<ThroughputItem label="DATA OUT" value={bytesOut} rate={bytesOutRate} />
			</div>
		</div>
	)
}

const ellipsisStyle: React.CSSProperties = {
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap"
}

interface StatItemProps {
	label: string
	value: string | number
	highlight?: boolean
}

const StatItem: FunctionComponent<StatItemProps> = ({ label, value, highlight }) => {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
			<div style={{
				fontSize: 9,
				opacity: 0.5,
				fontWeight: 500,
				letterSpacing: "0.02em"
			}}>
				{label}
			</div>
			<div style={{
				fontSize: 11,
				color: highlight ? "var(--cmp-select-bg)" : undefined,
				fontWeight: highlight ? 600 : 400,
			}}>
				{value}
			</div>
		</div>
	)
}

interface ThroughputItemProps {
	label: string
	value: { value: number; unit: string }
	rate?: { value: number; unit: string }
}

const ThroughputItem: FunctionComponent<ThroughputItemProps> = ({ label, value, rate }) => {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
			<div style={{
				fontSize: 9,
				opacity: 0.5,
				fontWeight: 500,
				letterSpacing: "0.02em"
			}}>
				{label}
			</div>
			<div style={{ fontSize: 11 }}>
				<span>{value.value?.toFixed(1) ?? "--"}</span>
				<span style={{ opacity: 0.6 }}>{value.unit}</span>
				<span style={{ opacity: 0.3 }}> / </span>
				<span style={{ color: "var(--cmp-select-bg)" }}>{rate?.value?.toFixed(1) ?? "--"}</span>
				<span style={{ opacity: 0.6 }}>{rate?.unit}</span>
			</div>
		</div>
	)
}
