import FrameworkCard from "@/components/cards/FrameworkCard"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { KVEntry, OPERATION } from "@/types/KVEntry"
import { dateShow } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import KvEntryIcon from "../../../../icons/cards/KvEntryIcon"
import FormatDialog from "../../../editor/FormatDialog"
import clsCardRedeye from "../../CardMintDef.module.css"
import clsCardBoring from "../../CardBoringDef.module.css"
import ActionsCmp from "./Actions"
import DetailForm from "./DetailForm"
import { Dialog, List } from "@priolo/jack"
import { RenderRowBaseProps } from "@priolo/jack"
import layoutSo from "@/stores/layout"



interface Props {
	store?: KVEntryStore
}

const KVEntryDetailView: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)
	useStore(layoutSo)

	// HOOKs
	useEffect(() => {
		kventrySo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleHistoryClose = () => kventrySo.setHistoryOpen(false)
	const handleHistorySelect = (index: number) => kventrySo.revisionSelect(kventrySa.kventry.history[index]?.revision)

	// RENDER
	const history = kventrySa.kventry.history?.sort((h1, h2) => h2.revision - h1.revision)
	const historySelected = kventrySo.getKVSelectIndex()
	const clsCard = layoutSo.state.theme == "redeye" ? clsCardRedeye : clsCardBoring

	return <FrameworkCard
		className={clsCard.root}
		icon={<KvEntryIcon />}
		store={kventrySo}
		actionsRender={<ActionsCmp store={kventrySo} />}
	>
		<DetailForm store={kventrySo} />
		<Dialog
			open={kventrySa.historyOpen}
			title="HISTORY"
			store={kventrySo}
			onClose={handleHistoryClose}
		>
			<List<KVEntry>
				items={history}
				select={historySelected}
				onSelect={handleHistorySelect}
				RenderRow={HystoryRow}
			/>
		</Dialog>
		<FormatDialog store={kventrySo} />
	</FrameworkCard>
}

export default KVEntryDetailView



const HystoryRow: FunctionComponent<RenderRowBaseProps<KVEntry>> = ({
	item,
}) => {

	const operation = {
		[OPERATION.DELETE]: "DELETE",
		[OPERATION.PURGE]: "PURGE",
		[OPERATION.PUT]: "PUT",
	}[item.operation] ?? "--"
	const time = dateShow(item.lastUpdate)

	return <div style={{ whiteSpace: 'pre', margin: "4px 5px 5px 5px" }}>
		<span style={{ fontSize: 13, fontWeight: 800 }}>{item.revision} </span>
		<span style={{ backgroundColor: "rgba(0,0,0,.5)", fontSize: 10, color: "#FFF", borderRadius: 3, padding: "3px 4px" }}>{operation}</span>
		<span style={{ fontWeight: 400 }}> {time}</span>
	</div>

}
