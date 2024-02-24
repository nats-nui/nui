import FrameworkCard from "@/components/cards/FrameworkCard"
import Button from "@/components/buttons/Button"
import Table from "@/components/table"
import docSo from "@/stores/docs"
import { KVEntriesStore } from "@/stores/stacks/kventry"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { KVEntry } from "@/types/KVEntry"
import { useStore } from "@priolo/jon"
import dayjs from "dayjs"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: KVEntriesStore
}

const KVEntryListView: FunctionComponent<Props> = ({
	store: kventriesSo,
}) => {

	// STORE
	const kventriesSa = useStore(kventriesSo)
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		kventriesSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (index: number) => kventriesSo.select(kventries[index].key)
	const handleNew = () => kventriesSo.create()
	const handleDelete = () => kventriesSo.delete()

	// RENDER
	const kventries = kventriesSa.all
	if (!kventries) return null
	const selected = kventriesSa.select
	const selectedIndex = kventriesSo.getIndexByName(kventriesSa.select)
	const variant = kventriesSa.colorVar
	const isSelected = (kventry: KVEntry) => selected == kventry.key
	const isNewSelect = kventriesSa.linked?.state.type == DOC_TYPE.KVENTRY && (kventriesSa.linked as KVEntryStore).state.editState == EDIT_STATE.NEW

	return <FrameworkCard styleBody={{ paddingTop: 0 }}
		store={kventriesSo}
		actionsRender={<>
			{!!selected && <Button
				label="DELETE"
				variant={variant}
				onClick={handleDelete}
			/>}
			<Button
				label="NEW"
				select={isNewSelect}
				variant={variant}
				onClick={handleNew}
			/>
		</>}
	>
		<div style={{ marginLeft: -9, marginRight: -9 }}>
			<Table
				items={kventries}
				props={[
					{ label: "REVISION", getValue: b => b.revision },
					{ 
						label: "LAST", 
						getShow: i => dayjs(i.lastUpdate).format("DD/MM/YYYY HH:mm"), 
						getValue: b => dayjs(b.lastUpdate).valueOf() 
					},
					//{ label: "OPERATION", getValue: b => b.operation },
					{ 
						label: "DELETED", 
						getShow: i => i.isDeleted ? "YES" : "NO", 
						getValue: b => b.isDeleted ? 1 : 0 
					},
				]}
				propMain={{ getValue: b => b.key }}
				select={selectedIndex}
				onSelectChange={handleSelect}
				variant={variant}
			/>
		</div>
	</FrameworkCard>
}

export default KVEntryListView