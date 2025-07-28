import ArrowDownIcon from "@/icons/ArrowDownIcon"
import ArrowUpIcon from "@/icons/ArrowUpIcon"
import { ConnzConnection } from "@/types/Metrics"
import { compactByte, compactNumber } from "@/utils/conversion"
import { getDeltaTime } from "@/utils/timeUtils"
import { TooltipWrapCmp } from "@priolo/jack"
import dayjs from "dayjs"
import { FunctionComponent } from "react"



interface ClientRowProps {
	cnn: ConnzConnection
}

const ClientRow: FunctionComponent<ClientRowProps> = ({ cnn }) => {

	const startActivity = dayjs(cnn.start).format("YYYY-MM-DD HH:mm:ss")
	const lastActivity = dayjs(cnn.last_activity).format("YYYY-MM-DD HH:mm:ss")
	const [lastActivityDelta, isRecentActivity] = getDeltaTime(cnn.last_activity)
	const rtt = parseInt(cnn.rtt) + cnn.rtt.slice(-2)
	const pending = compactByte(cnn?.pending_bytes)

	const lang = `${cnn.lang?.toLowerCase() ?? "--"} v${cnn.version ?? "--"}`

	const msgsIn = compactNumber(cnn?.in_msgs)
	const msgsInRate = compactNumber(cnn?.nui_in_msgs_sec)
	const msgsOut = compactNumber(cnn?.out_msgs)
	const msgsOutRate = compactNumber(cnn?.nui_out_msgs_sec)

	const bytesOut = compactByte(cnn?.out_bytes)
	const bytesOutRate = compactByte(cnn?.nui_out_bytes_sec)
	const bytesIn = compactByte(cnn?.in_bytes)
	const bytesInRate = compactByte(cnn?.nui_in_bytes_sec)

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
			<div style={{ display: "flex", gap: 3, alignItems: "center" }}>
				<div style={{
					width: "8px",
					height: "8px",
					borderRadius: "50%",
					backgroundColor: isRecentActivity ? "var(--color-mint)" : "#575757ff",
					marginRight: "4px",
				}} />
				<div style={{ flex: 1, ...elipsisStyle }}> <span style={{ fontWeight: 700 }}>{cnn.cid}</span> / {cnn.ip}:{cnn.port}</div>
				<div style={{ backgroundColor: "var(--cmp-select-bg)", padding: "2px 4px", borderRadius: "2px", fontSize: 10, color: "#000" }}>
					{lang}
				</div>
			</div>

			{/* NAME */}
			{cnn.name && <div style={{ color: "var(--cmp-select-bg)", ...elipsisStyle }}>{cnn.name}</div>}

			{/* PROPERTIES */}
			<div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "0px" }}>

				<div style={{ display: "flex", gap: "10px" }}>
					<TooltipWrapCmp content={lastActivity}>
						<ValueCmp title="LAST ACT." value={lastActivityDelta} style={{ color: isRecentActivity ? "var(--cmp-select-bg)" : undefined }} />
					</TooltipWrapCmp>
					<ValueCmp title="START" value={startActivity} />
					<ValueCmp title="UPTIME" value={cnn.uptime} />
					<ValueCmp title="RTT" value={rtt} />
					<ValueCmp title="SUBS." value={cnn.subscriptions} />
					<ValueCmp title="PENDING" value={pending.value + pending.unit} />
				</div>

				<div style={{ display: "flex" }}>
					<Value2Cmp title="MESS. IN" value={msgsIn} rate={msgsInRate} />

					<Value2Cmp title="MESS. OUT" value={msgsOut} rate={msgsOutRate} />

					<Value2Cmp title="DATA IN" value={bytesIn} rate={bytesInRate} />

					<Value2Cmp title="DATA OUT" value={bytesOut} rate={bytesOutRate} />
				</div>

			</div>
		</div>
	)
}

export default ClientRow

const elipsisStyle: React.CSSProperties = {
	overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
}


function showValueAndUnit({ value, unit }: { value: number, unit: string }): string {
	if (value === undefined || value === null) return "--"
	return value.toFixed(1) + unit
}


interface ValueCmpProps {
	title: string
	value: string | number
	style?: React.CSSProperties
}

const ValueCmp: FunctionComponent<ValueCmpProps> = ({ title, value, style }) => {
	return (
		<div style={{ display: "flex", flexDirection: "column", ...style, ...elipsisStyle }}>
			<div style={{ color: "#888", fontSize: 10 }}>{title}</div>
			<div>{value}</div>
		</div>
	)
}

interface Value2CmpProps {
	title: string
	value: { value: number, unit: string }
	rate?: { value: number, unit: string }
	style?: React.CSSProperties
}

const Value2Cmp: FunctionComponent<Value2CmpProps> = ({ title, value, rate, style }) => {
	return (
		<div style={{ display: "flex", flexDirection: "column", flex: 1, ...style }}>
			<div style={{ color: "#888", fontSize: 10 }}>{title}</div>
			<div>
				<span>{value.value?.toFixed(1) ?? "--"}</span><span>{value.unit}</span>
				<span> / </span>
				<span>{rate.value?.toFixed(1) ?? "--"}</span><span>{rate.unit}</span>
			</div>
		</div>
	)
}
interface ValueInOutCmpProps {
	title: string
	valueIn: string
	valueInRate: string
	valueOut: string
	valueOutRate: string
}

const ValueInOutCmp: FunctionComponent<ValueInOutCmpProps> = ({
	title,
	valueIn,
	valueInRate,
	valueOut,
	valueOutRate,
}) => {
	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
			<div style={{ color: "#888", fontSize: 10 }}>{title}</div>
			<div style={{ display: "flex" }}>

				<TooltipWrapCmp content="RECEIVE" style={{ marginRight: 3, display: "flex", alignItems: "center" }}>
					<ArrowUpIcon />
					<div>{valueIn}</div>
				</TooltipWrapCmp>
				<TooltipWrapCmp content="RECEIVE RATE PER SECOND" style={{ display: "flex", alignItems: "center" }}>
					/
					<div>{valueInRate}</div>
				</TooltipWrapCmp>

				<div style={{ flex: 1 }} />

				<TooltipWrapCmp content="SEND" style={{ marginRight: 3, display: "flex", alignItems: "center" }}>
					<ArrowDownIcon />
					{valueOut}
				</TooltipWrapCmp>
				<TooltipWrapCmp content="SEND RATE PER SECOND" style={{ display: "flex", alignItems: "center" }}>
					/
					{valueOutRate}
				</TooltipWrapCmp>
			</div>
		</div>
	)
}