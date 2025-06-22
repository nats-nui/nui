import { FunctionComponent } from "react"
import { ConnzConnection } from "@/types/Metrics"
import dayjs from "dayjs"
import ArrowUpIcon from "@/icons/ArrowUpIcon"
import ArrowDownIcon from "@/icons/ArrowDownIcon"
import { compactByte, compactNumber } from "@/utils/conversion"
import styles from "./ClientRow.module.css"



interface ClientRowProps {
	cnn: ConnzConnection
}

const ClientRow: FunctionComponent<ClientRowProps> = ({ cnn }) => {

	const start = dayjs(cnn.start).format("YYYY-MM-DD HH:mm:ss")
	const last = dayjs(cnn.last_activity).format("YYYY-MM-DD HH:mm:ss")
	const msgsIn = compactNumber(cnn?.in_msgs)
	const msgsOut = compactNumber(cnn?.out_msgs)
	const bytesOut = compactByte(cnn?.out_bytes)
	const bytesIn = compactByte(cnn?.in_bytes)

	return (
		<div key={cnn.cid} style={{
			padding: "8px",
			marginBottom: "8px",
			border: "1px solid #333",
			borderRadius: "3px",
			backgroundColor: "#1a1a1a",
			fontSize: 12, fontWeight: 400,
		}}>
			<div style={{ display: "flex", gap: 3 }}>
				<div style={{ flex: 1 }}>CID {cnn.cid} / {cnn.ip}:{cnn.port}</div>
				
				{cnn.version && <>v:{cnn.version}</>}<span style={{ color: "#888" }}>{cnn.lang}</span>
			</div>
			
			{cnn.name && <div>{cnn.name}</div>}



			<div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "0px 10px" }}>
				<ValueCmp title="START" value={start} />
				<ValueCmp title="LAST ACTIVITY" value={last} />
				<ValueCmp title="UPTIME" value={cnn.uptime} />
				<ValueCmp title="RTT" value={cnn.rtt} />

				<ValueCmp title="SUB." value={cnn.subscriptions} />

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
}

const ValueCmp: FunctionComponent<ValueCmpProps> = ({ title, value }) => {
	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
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
			<div style={{ display: "flex", gap: 0 }}>
				<ArrowUpIcon />
				<div style={{ marginRight: 3 }}>{valueIn}</div>
				<ArrowDownIcon />
				<div>{valueIn}</div>
			</div>
		</div>
	)
}