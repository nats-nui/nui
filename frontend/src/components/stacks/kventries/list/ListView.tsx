import FrameworkCard from "@/components/cards/FrameworkCard"
import KvEntriesIcon from "@/icons/cards/KvEntriesIcon"
import { KVEntriesStore } from "@/stores/stacks/kventry"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { KVEntry } from "@/types/KVEntry"
import { formatNumber } from "@/utils/string"
import { dateShow } from "@/utils/time"
import { AlertDialog, Button, FindInputHeader, OptionsCmp, VTable } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import dayjs from "dayjs"
import { FunctionComponent, useEffect } from "react"
import clsCard from "../../CardMintDef.module.css"



interface Props {
	store?: KVEntriesStore
}

const KVEntryListView: FunctionComponent<Props> = ({
	store: kventriesSo,
}) => {

	// STORE
	const kventriesSa = useStore(kventriesSo)
	useStore(kventriesSo.state.group)

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

	return <FrameworkCard
		className={clsCard.root}
		icon={<KvEntriesIcon />}
		styleBody={{ padding: 0 }}
		store={kventriesSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={kventriesSo}
			/>
			<FindInputHeader
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
		<VTable
			items={kventries}
			props={[
				{
					label: "REVISION",
					getShow: i => formatNumber(i.revision),
					getValue: i => i.revision,
					flex: .5
				},
				{
					label: "LAST",
					getShow: i => dateShow(i.lastUpdate),
					getValue: i => dayjs(i.lastUpdate).valueOf(),
				},
				//{ label: "OPERATION", getValue: b => b.operation },
				{
					label: "DELETED",
					getShow: i => i.isDeleted ? "YES" : "NO",
					getValue: i => i.isDeleted ? 1 : 0,
					flex: .5,
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