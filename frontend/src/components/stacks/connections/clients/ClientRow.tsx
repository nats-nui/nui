import ArrowDownIcon from "@/icons/ArrowDownIcon"
import ArrowUpIcon from "@/icons/ArrowUpIcon"
import { ConnzConnection } from "@/types/Metrics"
import { compactByte, compactNumber } from "@/utils/conversion"
import { TooltipWrapCmp } from "@priolo/jack"
import dayjs from "dayjs"
import { FunctionComponent } from "react"



interface ClientRowProps {
	cnn: ConnzConnection
}

const ClientRow: FunctionComponent<ClientRowProps> = ({ cnn }) => {

	const start = dayjs(cnn.start).format("YYYY-MM-DD HH:mm:ss")

	const lastDjs = dayjs(cnn.last_activity)
	const last = lastDjs.format("YYYY-MM-DD HH:mm:ss")
	const isRecentActivity = dayjs().diff(lastDjs, 'minute') < 1

		// Calculate elapsed time since last activity
	const now = dayjs()
	const diffSeconds = now.diff(lastDjs, 'second')
	
	let lastTime: string
	if ( diffSeconds < 3 ) {
		lastTime = "just now"
	} else if (diffSeconds < 60) {
		lastTime = `${diffSeconds}s`
	} else {
		const days = Math.floor(diffSeconds / (24 * 60 * 60))
		const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60))
		const minutes = Math.floor((diffSeconds % (60 * 60)) / 60)
		const seconds = diffSeconds % 60
		
		const parts = []
		if (days > 0) parts.push(`${days}d`)
		if (hours > 0) parts.push(`${hours}h`)
		if (minutes > 0) parts.push(`${minutes}m`)
		if (seconds > 0 && parts.length < 2) parts.push(`${seconds}s`) // Only show seconds if less than 2 other units
		
		lastTime = parts.join('')
	}



	const msgsIn = compactNumber(cnn?.in_msgs)
	const msgsOut = compactNumber(cnn?.out_msgs)
	const bytesOut = compactByte(cnn?.out_bytes)
	const bytesIn = compactByte(cnn?.in_bytes)
	const rtt = parseInt(cnn.rtt) + cnn.rtt.slice(-2)
	const pending = compactByte(cnn?.pending_bytes)

	let color = {
		"go": "#10F3F3",
		"nats.js": "#EBFB35",
		"python": "#A480FF",
		"python3": "#A480FF",
		"java": "#F374E6",
		".net": "#6AFFAB",
		"rust": "#ff74a9",
	}[cnn.lang?.toLowerCase()] || "#A480FF"
	//color = "var(--cmp-select-bg)"
	const lang = `${cnn.lang?.toLowerCase() ?? "--"} v${cnn.version ?? "--"}`

	return (
		<div key={cnn.cid} style={{
			padding: "8px",
			marginBottom: "8px",
			border: "1px solid #333",
			borderRadius: "3px",
			backgroundColor: "#1a1a1a",
			fontSize: 12, fontWeight: 400,
		}}>

			{/* IDENTIFIE */}
			<div style={{ display: "flex", gap: 3 }}>
				<div style={{ flex: 1 }}> <span style={{ fontWeight: 700 }}>{cnn.cid}</span> / {cnn.ip}:{cnn.port}</div>
				<div style={{ backgroundColor: color, padding: "2px 4px", borderRadius: "2px", fontSize: 10, color: "#000" }}>
					{lang}
				</div>
			</div>

			{/* NAME */}
			{cnn.name && <div style={{ color: "var(--cmp-select-bg)" }}>{cnn.name}</div>}

			{/* PROPERTIES */}
			<div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "0px 10px" }}>
				<ValueCmp title="START" value={start} />
				<TooltipWrapCmp content={last}>
				<ValueCmp title="LAST ACTIVITY" value={lastTime} style={{ color: isRecentActivity ? "var(--cmp-select-bg)" : undefined }} />
				</TooltipWrapCmp>
				<ValueCmp title="UPTIME" value={cnn.uptime} />
				<ValueCmp title="RTT" value={rtt} />
				<ValueCmp title="SUB." value={cnn.subscriptions} />
				<ValueCmp title="PENDING" value={pending.value + pending.unit} />
				<ValueInOutCmp title="MESSAGES"
					valueIn={msgsIn.value + msgsIn.unit}
					valueOut={msgsOut.value + msgsOut.unit}
				/>
				<ValueInOutCmp title="BYTES"
					valueIn={bytesIn.value + bytesIn.unit}
					valueOut={bytesOut.value + bytesOut.unit}
				/>
			</div>
		</div>
	)
}

export default ClientRow

interface ValueCmpProps {
	title: string
	value: string | number
	style?: React.CSSProperties
}

const ValueCmp: FunctionComponent<ValueCmpProps> = ({ title, value, style }) => {
	return (
		<div style={{ display: "flex", flexDirection: "column", ...style }}>
			<div style={{ color: "#888", fontSize: 10 }}>{title}</div>
			<div>{value}</div>
		</div>
	)
}

interface ValueInOutCmpProps {
	title: string
	valueIn: string | number
	valueOut: string | number
}

const ValueInOutCmp: FunctionComponent<ValueInOutCmpProps> = ({
	title,
	valueIn,
	valueOut,
}) => {
	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<div style={{ color: "#888", fontSize: 10 }}>{title}</div>
			<div style={{ display: "flex" }}>
				<TooltipWrapCmp content="RECEIVE" style={{ marginRight: 3, display: "flex", alignItems: "center" }}>
					<ArrowUpIcon />
					<div>{valueIn}</div>
				</TooltipWrapCmp>
				<TooltipWrapCmp content="SEND" style={{ marginRight: 3, display: "flex", alignItems: "center" }}>
					<ArrowDownIcon />
					{valueIn}
				</TooltipWrapCmp>
			</div>
		</div>
	)
}