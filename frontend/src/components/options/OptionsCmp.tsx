import Dialog from "@/components/dialogs/Dialog"
import List from "@/components/lists/List"
import TimerCmp, { TIMER_STATE } from "@/components/options/TimerCmp"
import ArrowLeftIcon from "@/icons/ArrowLeftIcon"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { LOAD_MODE, LOAD_STATE } from "@/stores/stacks/utils"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo, useState } from "react"
import IconButton from "../buttons/IconButton"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { ANIM_TIME_CSS } from "@/types"
import CloseIcon from "@/icons/CloseIcon"
import ReloadIcon from "@/icons/ReloadIcon"
import layoutSo, { COLOR_VAR } from "@/stores/layout"



interface OptionSelect {
	label: string
	polling: number
	mode: LOAD_MODE
}
const options: OptionSelect[] = [
	{ label: "MANUAL", polling: 0, mode: LOAD_MODE.MANUAL },
	{ label: "PARENT", polling: 0, mode: LOAD_MODE.PARENT },
	{ label: "5 SECONDS", polling: 5000, mode: LOAD_MODE.POLLING },
	{ label: "10 SECONDS", polling: 10000, mode: LOAD_MODE.POLLING },
	{ label: "1 MINUTE", polling: 1000 * 60, mode: LOAD_MODE.POLLING },
	{ label: "10 MINUTES", polling: 1000 * 600, mode: LOAD_MODE.POLLING },
]

interface Props {
	store?: KVEntryStore
	style?: React.CSSProperties
}

/**
 * Componente che gestisce il Loding/Reloading/Polling
 */
const OptionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	const storeSa = useStore(store)

	// HOOKs
	const [dialogOpen, setDialogOpen] = useState(false)
	const [optionSelIndex, setOptionSelIndex] = useState(0)
	const [mouseEnter, setMouseEnter] = useState(false)

	// HANDLER
	const handleTimeout = async () => {
		store.fetch()
	}
	const handleOptionsChange = (index: number) => {
		setOptionSelIndex(index)
		const option = options[index]
		if (!option) return
		store.setLoadingMode(option.mode)
		store.setPollingTime(option.polling)
		setDialogOpen(false)
	}
	const handleCircleClick = () => {
		if (storeSa.loadingState == LOAD_STATE.LOADING) {
			store.fetchAbort()
		} else if (storeSa.loadingState == LOAD_STATE.IDLE) {
			store.fetch()
		} else if (storeSa.loadingState == LOAD_STATE.ERROR) {
			store.setLoadingState(LOAD_STATE.IDLE)
		}
	}

	// RENDER
	const timerState = useMemo(() => {
		if (storeSa.loadingState == LOAD_STATE.ERROR) return TIMER_STATE.STOP
		if (storeSa.loadingState == LOAD_STATE.LOADING) return TIMER_STATE.LOADING
		return {
			[LOAD_MODE.MANUAL]: TIMER_STATE.STOP,
			[LOAD_MODE.PARENT]: TIMER_STATE.STOP,
			[LOAD_MODE.POLLING]: TIMER_STATE.PLAY,
		}[storeSa.loadingMode] ?? TIMER_STATE.STOP
	}, [storeSa.loadingMode, storeSa.loadingState])
	const timeout = storeSa.pollingTime
	const inError = storeSa.loadingState == LOAD_STATE.ERROR
	const inLoading = storeSa.loadingState == LOAD_STATE.LOADING
	const inParentMode = storeSa.loadingMode == LOAD_MODE.PARENT
	const color = inError ? "red" : undefined

	return <>

		<div style={{ ...cssRoot, ...style }}
			onMouseEnter={() => setMouseEnter(true)}
			onMouseLeave={() => setMouseEnter(false)}
		>
			<TimerCmp style={{ width: 24, height: 24 }}
				bgColor={color}
				state={timerState}
				timeout={timeout}
				interval={1000}
				onTimeout={handleTimeout}
			/>

			<div style={cssAcc(mouseEnter)}>
				<IconButton
					onClick={() => setDialogOpen(true)}
				><ArrowRightIcon /></IconButton>
			</div>

			<div style={{...cssIconContainer, ...{ color }}}
				onClick={handleCircleClick}
			>
				{inLoading || inError ? (
					<CloseIcon />
				) : <>
					{inParentMode ? (
						<ArrowLeftIcon />
					) : (
						<ReloadIcon />
					)}
				</>}
			</div>
		</div>

		<Dialog
			open={dialogOpen}
			title="AUTORELOAD"
			store={store}
			onClose={() => setDialogOpen(false)}
		>
			<List<OptionSelect>
				items={options}
				select={optionSelIndex}
				onSelect={handleOptionsChange}
				RenderRow={({ item }) => item.label}
			/>
		</Dialog>

	</>
}

export default OptionsCmp

const cssRoot: React.CSSProperties = {
	display: "flex",
	cursor: "pointer",
	position: "relative",
	color: "rgba(0,0,0,.4)",
	alignItems: "center",
}

const cssIconContainer: React.CSSProperties = {
	width: 24,
	height: 24,
	position: "absolute",
	display: "flex",
	alignItems: "center",
	justifyContent: "center"
}

const cssAcc = (mouseEnter: boolean): React.CSSProperties => ({
	width: mouseEnter ? 40 : 0,
	transition: `width ${ANIM_TIME_CSS}ms`,
})