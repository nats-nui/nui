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



interface Props {
	store?: CnnMetricsStore
}

const CnnMetricsView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store.state.group)
	useStore(store)

	// HOOKs

	// HANDLER
	const handleClientsClick = () => store.openClients()

	// RENDER
	const isClientsOpen = store.getClientOpen()
	const test = store.state.test

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

			<div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
				<ValueCmp label="CPU" value={test?.nats?.test ?? "--"} unit="%" />
				<div className="lbl-divider-vl" />
				<ValueCmp label="MEMORY" value={"95.41"} unit="MiB" />
				<div className="lbl-divider-vl" />
				<ValueCmp label="MEMORY" value={"95.41"} unit="MiB" />
			</div>

			<div className="jack-lbl-prop">SEND</div>

			<div style={{ display: "flex", gap: 15 }}>
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp label="MESSAGE" value={12} unit="%" />
					<ValueCmp label="RATE" value={"95.41"} unit="MiB" />
				</div>
				<div className="lbl-divider-vl" />
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp label="DATA" value={12} unit="%" />
					<ValueCmp label="RATE" value={"95.41"} unit="MiB" />
				</div>
			</div>

			<div className="jack-lbl-prop">RECEIVE</div>

			<div style={{ display: "flex", gap: 15 }}>
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp label="MESSAGE" value={12} unit="M" />
					<ValueCmp label="RATE" value={"95.41"} unit="/s" />
				</div>
				<div className="lbl-divider-vl" />
				<div style={{ display: "flex", gap: 10, flex: 1 }}>
					<ValueCmp label="DATA" value={12} unit="M" />
					<ValueCmp label="RATE" value={"95.41"} unit="/s" />
				</div>
			</div>


		</TitleAccordion>


		<TitleAccordion title="CONNECTIONS" style={{ marginBottom: 15 }}>
			<div style={{ display: "flex", marginTop: 10 }}>
				<ValueCmp style={{ flex: 1 }} label="TOTAL" value={12} unit="%" />
				<ValueCmp style={{ flex: 1 }} label="SUBSCRIPTION" value={"95.41"} unit="MiB" />
				<ValueCmp style={{ flex: 1 }} label="SLOW" value={"95.41"} unit="MiB" />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="CONNECTION" value={12} unit="%" />
				<ValueCmp style={{ flex: 1 }} label="PAYLOAD" value={"95.41"} unit="MiB" />
				<ValueCmp style={{ flex: 1 }} label="PENDING" value={"95.41"} unit="MiB" />
			</div>

			<div style={{ display: "flex" }}>
				<ValueCmp style={{ flex: 1 }} label="WRITE DEADLINE" value={12} unit="%" />
				<ValueCmp style={{ flex: 1 }} label="AUTH.TIMEOUT" value={"95.41"} unit="MiB" />
				<ValueCmp style={{ flex: 1 }} label="TLS TIMEOUT" value={"95.41"} unit="MiB" />
			</div>
		</TitleAccordion>

	</FrameworkCard>
}

export default CnnMetricsView
