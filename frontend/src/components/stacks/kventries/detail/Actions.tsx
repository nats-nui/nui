import TimerCmp, { TIMER_STATE } from "@/components/TimerCmp"
import Button from "@/components/buttons/Button"
import IconButton from "@/components/buttons/IconButton"
import Dialog from "@/components/dialogs/Dialog"
import FormatAction from "@/components/editor/FormatAction"
import List from "@/components/lists/List"
import ArrowLeftIcon from "@/icons/ArrowLeftIcon"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"



const reloads = [
	{ label: "never", value: 0 },
	{ label: "parent", value: -1 },
	{ label: "5 seconds", value: 5000 },
	{ label: "10 seconds", value: 10000 },
	{ label: "1 minute", value: 1000 * 60 },
	{ label: "10 minutes", value: 1000 * 600 },
]

interface Props {
	store?: KVEntryStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)

	// HOOKs
	useEffect(() => {
		setTimerState(TIMER_STATE.PLAY)
		return () => setTimerState(TIMER_STATE.STOP)
	})
	const [reloadOpen, setRealoadOpen] = useState(false)
	const [reloadIndex, setReloadIndex] = useState(3)
	const [timerState, setTimerState] = useState(TIMER_STATE.STOP)

	// HANDLER
	const handleEdit = () => kventrySo.setEditState(EDIT_STATE.EDIT)
	const handleSave = () => kventrySo.save()
	const handleCancel = () => kventrySo.restore()
	const handleHistoryOpen = () => {
		kventrySo.fetch()
		kventrySo.setHistoryOpen(true)
	}
	const handleTimeout = () => kventrySo.fetch()
	const handleReloadChange = (index: number) => {
		setReloadIndex(index)
		const reload = reloads[index]
		if (reload.value == 0) {
			setTimerState(TIMER_STATE.STOP)
		} else if (reload.value == -1) {
			setTimerState(TIMER_STATE.STOP)
		} else {
			setTimerState(TIMER_STATE.PLAY)
		}
		setRealoadOpen(false)
	}
	const handleRevisionNextChange = () => kventrySo.revisionOffset(+1)
	const handleRevisionPrevChange = () => kventrySo.revisionOffset(-1)


	// RENDER

	const kventry = kventrySo.getKVSelect()
	if (!kventry) return null
	const variant = kventrySa.colorVar
	const isReloadParent = reloads[reloadIndex]?.value == -1
	const timeout = reloads[reloadIndex]?.value ?? 0

	if (kventrySa.editState == EDIT_STATE.READ) return <>



		<div style={{ cursor: "pointer", position: "relative", marginLeft: 3 }}
			onClick={() => setRealoadOpen(true)}
		>
			{isReloadParent && (
				<ArrowLeftIcon style={{ position: "absolute", color: "#000", left: 2, top: 3, opacity: .5 }} />
			)}
			<TimerCmp style={{ width: 20, height: 20 }}
				state={timerState}
				timeout={timeout}
				interval={1000}
				onTimeout={handleTimeout}
			/>
		</div>
		<Dialog
			open={reloadOpen}
			title="AUTORELOAD"
			store={kventrySo}
			onClose={() => setRealoadOpen(false)}
		>
			<List<{ label: string, value: number }>
				items={reloads}
				select={reloadIndex}
				onSelect={handleReloadChange}
				RenderRow={({ item }) => item.label}
			/>
		</Dialog>

		<div style={{ flex: 1 }} />



		<FormatAction store={kventrySo} />
		<div style={{ height: "20px", width: "2px", backgroundColor: "rgba(255,255,255,.3)" }} />


		<Button
			children="EDIT"
			variant={variant}
			onClick={handleEdit}
		/>
		<div style={{ display: "flex" }}>
			<IconButton style={{ padding: "2px 0px" }}
				onClick={handleRevisionPrevChange}
			><ArrowLeftIcon /></IconButton>
			<Button
				variant={variant}
				onClick={handleHistoryOpen}
			>VER: {kventry.revision ?? "--"}</Button>
			<IconButton style={{ padding: "2px 0px" }}
				onClick={handleRevisionNextChange}
			><ArrowRightIcon /></IconButton>
		</div>
	</>



	const inNew = kventrySa.editState == EDIT_STATE.NEW
	const label = inNew ? "CREATE" : "SAVE"
	const formatSel = kventrySa.format?.toUpperCase() ?? ""

	return (<>
		<FormatAction store={kventrySo} />
		<div style={{ height: "20px", width: "2px", backgroundColor: "rgba(255,255,255,.3)" }} />
		<Button
			children={label}
			variant={variant}
			onClick={handleSave}
		/>
		{!inNew && (
			<Button
				children="CANCEL"
				variant={variant}
				onClick={handleCancel}
			/>
		)}
	</>)
}

export default ActionsCmp
