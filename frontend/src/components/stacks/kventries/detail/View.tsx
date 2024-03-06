import FrameworkCard from "@/components/cards/FrameworkCard"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import DetailForm from "./DetailForm"
import Dialog from "@/components/dialogs/Dialog"
import List from "@/components/lists/List"
import { KVEntry } from "@/types/KVEntry"
import FormatDialog from "../../messages/FormatDialog"



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
	const variant = kventrySa.colorVar
	const history = kventrySa.kventry.history.sort((h1, h2) => h2.revision - h1.revision)
	const historySelected = kventrySa.kventry.history?.findIndex(kv => kv.revision == kventrySa.revisionSelected)

	return <FrameworkCard
		variantBg={variant}
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
				items={kventrySa.kventry.history}
				select={historySelected}
				onSelect={handleHistorySelect}
				RenderRow={({ item }) => `${item.key} ${item.revision}`}
			/>
		</Dialog>
		<FormatDialog store={kventrySo} />
	</FrameworkCard>
}

export default KVEntryDetailView
