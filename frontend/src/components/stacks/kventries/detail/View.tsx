import FrameworkCard from "@/components/cards/FrameworkCard"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import DetailForm from "./DetailForm"
import Dialog from "@/components/dialogs/Dialog"
import List from "@/components/lists/List"
import { KVEntry, OPERATION } from "@/types/KVEntry"
import FormatDialog from "../../../editor/FormatDialog"
import { RenderRowBaseProps } from "@/components/lists/EditList"
import dayjs from "dayjs"
import { dateShow } from "@/utils/time"



interface Props {
	store?: KVEntryStore
}

const KVEntryDetailView: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)

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

	return <FrameworkCard
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
