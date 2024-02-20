import { CSSProperties, FunctionComponent, useEffect, useRef, useState } from "react"
import CircularIndicatorCmp from "./CircularIndicatorCmp"
import { delay } from "@/utils/time"



interface Props {
	state?: TIMER_STATE
	timeout?: number
	interval?: number
	style?: CSSProperties

	onTimeout?: () => void
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
			setPerc(interval / timeout)
			startTimer()
		} else if (state == TIMER_STATE.STOP) {
			setAnimTime(10)
			setPerc(0)
		}
		return stopTimer
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
		if (!!idInterval.current) clearInterval(idInterval.current)
	}
	const startTimer = () => idInterval.current = setTimeout(update, interval)

	// RENDER
	return <CircularIndicatorCmp
		style={style}
		perc={perc}
		animTime={animTime}
	/>
}

export default TimerCmp

export enum TIMER_STATE {
	STOP,
	PLAY,
	PAUSE,
}