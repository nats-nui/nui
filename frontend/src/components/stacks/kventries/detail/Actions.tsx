import Button from "@/components/buttons/Button"
import IconButton from "@/components/buttons/IconButton"
import OptionsCmp from "@/components/options/OptionsCmp"
import FormatAction from "@/components/editor/FormatAction"
import ArrowLeftIcon from "@/icons/ArrowLeftIcon"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: KVEntryStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)

	// HOOKs

	// HANDLER
	const handleEdit = () => kventrySo.setEditState(EDIT_STATE.EDIT)
	const handleSave = () => kventrySo.save()
	const handleCancel = () => kventrySo.restore()
	const handleHistoryOpen = () => {
		//kventrySo.fetch()
		kventrySo.setHistoryOpen(true)
	}
	const handleRevisionNextChange = () => kventrySo.revisionOffset(+1)
	const handleRevisionPrevChange = () => kventrySo.revisionOffset(-1)

	// RENDER
	const kventry = kventrySo.getKVSelect()
	if (!kventry) return null

	if (kventrySa.editState == EDIT_STATE.READ) return <>

		<OptionsCmp store={kventrySo} style={{ marginLeft: 5 }} />

		<div style={{ flex: 1 }} />

		<FormatAction store={kventrySo} />
		<div style={{ height: "20px", width: "2px", backgroundColor: "rgba(255,255,255,.3)" }} />

		<Button
			children="PUT"
			onClick={handleEdit}
		/>
		<div style={{ display: "flex" }}>

			<IconButton style={{ padding: "2px 0px" }}
				onClick={handleRevisionPrevChange}
			><ArrowLeftIcon /></IconButton>

			<Button
				onClick={handleHistoryOpen}
				select={kventrySa.historyOpen}
			>REV: {kventry.revision ?? "--"}</Button>

			<IconButton style={{ padding: "2px 0px" }}
				onClick={handleRevisionNextChange}
			><ArrowRightIcon /></IconButton>

		</div>
	</>



	const inNew = kventrySa.editState == EDIT_STATE.NEW
	const label = inNew ? "CREATE" : "SAVE"

	return (<>
		<FormatAction store={kventrySo} />
		<div style={{ height: "20px", width: "2px", backgroundColor: "rgba(255,255,255,.3)" }} />
		<Button
			children={label}
			onClick={handleSave}
		/>
		{!inNew && (
			<Button
				children="CANCEL"
				onClick={handleCancel}
			/>
		)}
	</>)
}

export default ActionsCmp
