import FrameworkCard from "@/components/FrameworkCard"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import ShowForm from "./ShowForm"
import Dialog from "@/components/dialogs/Dialog"
import List from "@/components/lists/List"
import { KVEntry } from "@/types/KVEntry"



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
	const handleHistorySelect = (index:number) => kventrySo.revisionSelect(history[index]?.revision)

	// RENDER
	const variant = kventrySa.colorVar
	const history = kventrySa.kventry.history
	const historySelected = history?.findIndex( kv => kv.revision == kventrySa.revisionSelected )

	return <FrameworkCard
		variantBg={variant}
		store={kventrySo}
		actionsRender={<ActionsCmp store={kventrySo} />}
	>
		<ShowForm store={kventrySo} />
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
				RenderRow={({item})=> `${item.key} ${item.revision}`}
			/>
		</Dialog>
	</FrameworkCard>
}

export default KVEntryDetailView
