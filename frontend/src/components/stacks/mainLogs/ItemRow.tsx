import { Log } from "@/stores/log/utils"
import { dateShow } from "@/utils/time"
import { CopyButton } from "@priolo/jack"
import { FunctionComponent, useMemo } from "react"
import cls from "./ItemRow.module.css"



interface Props {
	log?: Log
	index?: number
	onClick?: (log: Log) => void
}

const ItemRow: FunctionComponent<Props> = ({
	log,
	index,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleClick = () => onClick?.(log)

	// RENDER
	if (!log) return null
	const time = useMemo(
		() => log.receivedAt ? dateShow(log.receivedAt) : null,
		[log.receivedAt]
	)
	const clsBg = index % 2 == 0 ? cls.bg1 : cls.bg2
	const clsRoot = `${cls.root} ${clsBg} ${cls[log.type]}`

	return (
		<div className={clsRoot}
			onClick={handleClick}
		>
			<div className={`jack-hover-container ${cls.title}`}>
				{log.title ?? "--"}
				<CopyButton absolute value={log.body} />
			</div>

			<div className={cls.body}>
				{log.body ?? "--"}
			</div>

			{time && <div className={cls.footer}>{time}</div>}
		</div>
	)
}

export default ItemRow
