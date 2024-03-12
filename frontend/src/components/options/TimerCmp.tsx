import { delay } from "@/utils/time"
import { CSSProperties, FunctionComponent, useEffect, useRef, useState } from "react"
import CircularIndicatorCmp from "./CircularIndicatorCmp"
import CircularLoadingCmp from "./CircularLoadingCmp"



interface Props {
	state?: TIMER_STATE
	timeout?: number
	/** OGNI QUANTO DEVE AGGIORNARE LA PERCENTUALE */
	interval?: number
	style?: CSSProperties

	/** ha raggiunto il 100% */
	onTimeout?: () => void
	/** è scattato un "INTERVAL" */
	onInterval?: () => void
}

/** Seleziona il contenuto da visualizzare in base al tipo di VIEW */
const TimerCmp: FunctionComponent<Props> = ({
	state,
	timeout,
	interval = 1000,
	style,

	onTimeout,
	onInterval,
}) => {

	// STORES

	// HOOKS
	const [perc, setPerc] = useState(0)
	const [animTime, setAnimTime] = useState(0)
	const timeStart = useRef(0)
	const idInterval = useRef(null)
	useEffect(() => {
		stopTimer()
		if (state == TIMER_STATE.PLAY && timeout > 0) {
			timeStart.current = Date.now()
			setAnimTime(interval)
			setPerc(0)
			//setPerc(interval / timeout)
			startTimer()
		} else if (state == TIMER_STATE.STOP || state == TIMER_STATE.LOADING) {
			setAnimTime(10)
			setPerc(0)
		}
		return () => stopTimer()
	}, [state, timeout])

	const update = async () => {
		const time = Date.now()
		const delta = time - timeStart.current
		let currentPerc = delta / timeout
		let nextPerc = currentPerc + (interval / timeout)
		if (currentPerc >= 1) {
			onTimeout?.()
			setAnimTime(100)
			setPerc(0)
			await delay(100)
			timeStart.current = Date.now()
			nextPerc = interval / timeout
		} else {
			onInterval?.()
		}
		setAnimTime(interval)
		setPerc(nextPerc)
		startTimer()
	}
	const stopTimer = () => {
		if (!idInterval.current) return
		clearTimeout(idInterval.current)
		idInterval.current = null
	}
	const startTimer = () => {
		if (!!idInterval.current) stopTimer()
		idInterval.current = setTimeout(update, interval)
	}

	// RENDER
	if (state == TIMER_STATE.LOADING) return (
		<CircularLoadingCmp
			style={style}
		/>
	)

	return (
		<CircularIndicatorCmp
			style={style}
			perc={perc}
			animTime={animTime}
		/>
	)
}

export default TimerCmp

export enum TIMER_STATE {
	STOP,
	PLAY,
	LOADING,
}