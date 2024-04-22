import Dialog from "@/components/dialogs/Dialog"
import List from "@/components/lists/List"
import TimerCmp, { TIMER_STATE } from "@/components/loaders/TimerCmp"
import ArrowLeftIcon from "@/icons/ArrowLeftIcon"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import CloseIcon from "@/icons/CloseIcon"
import ReloadIcon from "@/icons/ReloadIcon"
import SkullIcon from "@/icons/SkullIcon"
import { LoadBaseStore } from "@/stores/stacks/loadBase"
import { LOAD_MODE, LOAD_STATE } from "@/stores/stacks/utils"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo, useState } from "react"
import IconButton from "../buttons/IconButton"
import { ViewStore } from "@/stores/stacks/viewBase"
import cls from "./OptionsCmp.module.css"



interface OptionSelect {
	label: string
	polling: number
	mode: LOAD_MODE
}



const options: OptionSelect[] = [
	{ label: "MANUAL", polling: 0, mode: LOAD_MODE.MANUAL },
	{ label: "PARENT", polling: 0, mode: LOAD_MODE.PARENT },
	{ label: "1 SECOND", polling: 1000, mode: LOAD_MODE.POLLING },
	{ label: "5 SECONDS", polling: 5000, mode: LOAD_MODE.POLLING },
	{ label: "10 SECONDS", polling: 10000, mode: LOAD_MODE.POLLING },
	{ label: "1 MINUTE", polling: 1000 * 60, mode: LOAD_MODE.POLLING },
	{ label: "10 MINUTES", polling: 1000 * 600, mode: LOAD_MODE.POLLING },
]

interface Props {
	store?: LoadBaseStore
	storeView?: ViewStore
	style?: React.CSSProperties
}

/**
 * Componente che gestisce il Loding/Reloading/Polling
 */
const OptionsCmp: FunctionComponent<Props> = ({
	store,
	storeView,
	style,
}) => {

	// STORE
	storeView = storeView ?? store
	const storeSa = useStore(store)
	if (storeView != store) useStore(storeView)

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
	const haveParent = !!storeSa.parent
	const inError = storeSa.loadingState == LOAD_STATE.ERROR
	const inLoading = storeSa.loadingState == LOAD_STATE.LOADING
	const inParentMode = storeSa.loadingMode == LOAD_MODE.PARENT
	const color = inError ? "red" : (style.backgroundColor as string ?? "rgba(0,0,0,.4)")

	return <>

		<div style={{ ...style, backgroundColor: null, color }}
			className={`${cls.root}`}
			onMouseEnter={() => setMouseEnter(true)}
			onMouseLeave={() => setMouseEnter(false)}
		>
			<TimerCmp style={{ width: 24, height: 24, color }}
				state={timerState}
				timeout={timeout}
				interval={1000}
				onTimeout={handleTimeout}
			/>

			<div className={`${cls.btt} ${cls.btt_hover} color-fg`}>
				<IconButton
					onClick={() => setDialogOpen(true)}
				><ArrowRightIcon /></IconButton>
			</div>

			<div className={`${cls.circle} ani-color ${mouseEnter ? "color-fg" : ""}`}
				onClick={handleCircleClick}
			>
				{inLoading ? (
					<CloseIcon />
				) : inError ? (
					<SkullIcon style={{ width: 14, height: 14 }} />
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
			store={storeView}
			onClose={() => setDialogOpen(false)}
		>
			<List<OptionSelect>
				items={options}
				select={optionSelIndex}
				onSelect={handleOptionsChange}
				RenderRow2={(item) => item.mode == LOAD_MODE.PARENT && !haveParent
					? null
					: <div className={`list-row ${item.mode == LOAD_MODE.PARENT ? cls.divider : ""}`}>{item.label}</div>
				}
			/>
		</Dialog>

	</>
}

export default OptionsCmp
