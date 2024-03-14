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
import FindInput from "@/components/input/FindInput"
import AlertDialog from "@/components/dialogs/AlertDialog"
import OptionsCmp from "@/components/options/OptionsCmp"



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
	const handleSelect = (item: KVEntry) => kventriesSo.select(item.key)
	const handleNew = () => kventriesSo.create()
	const handleDelete = () => kventriesSo.delete()
	const handlePurge = () => kventriesSo.purge()


	// RENDER
	const kventries = kventriesSo.getFiltered() ?? []
	const selected = kventriesSa.select
	const isNewSelect = kventriesSa.linked?.state.type == DOC_TYPE.KVENTRY && (kventriesSa.linked as KVEntryStore).state.editState == EDIT_STATE.NEW

	return <FrameworkCard styleBody={{ padding: 0 }}
		store={kventriesSo}
		actionsRender={<>
			<OptionsCmp 
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={kventriesSo}  
			/>
			<FindInput
				value={kventriesSa.textSearch}
				onChange={text => kventriesSo.setTextSearch(text)}
			/>
			{!!selected && <Button
				children="DELETE"
				onClick={handleDelete}
			/>}
			{!!selected && <Button
				children="PURGE"
				onClick={handlePurge}
			/>}
			<Button
				children="NEW"
				select={isNewSelect}
				onClick={handleNew}
			/>
		</>}
	>
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
			selectId={selected}
			onSelectChange={handleSelect}
			getId={(item: KVEntry) => item.key}
		/>

		<AlertDialog store={kventriesSo} />

	</FrameworkCard>
}

export default KVEntryListView