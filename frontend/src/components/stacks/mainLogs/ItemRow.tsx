import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import CopyIcon from "@/icons/CopyIcon"
import { Log } from "@/stores/log/utils"
import dayjs from "dayjs"
import { FunctionComponent, useMemo, useState } from "react"
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
	const [bttCopyVisible, setBttCopyVisible] = useState(false)

	// HOOKs

	// HANDLER
	const handleClick = () => onClick?.(log)
	const handleClipboardClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
		navigator.clipboard.writeText(log.body)
	}
	const handleTitleEnter = () => setBttCopyVisible(true)
	const handleTitleLeave = () => setBttCopyVisible(false)

	// RENDER
	if (!log) return null
	const time = useMemo(
		() => log.receivedAt ? dayjs(log.receivedAt).format("YYYY-MM-DD HH:mm:ss") : null,
		[log.receivedAt]
	)
	const clsBg = index % 2 == 0 ? cls.bg1 : cls.bg2
	const clsRoot = `${cls.root} ${clsBg} ${cls[log.type]}`

	return (
		<div className={clsRoot}
			onClick={handleClick}
		>
			<div className={cls.title}
				onMouseEnter={handleTitleEnter}
				onMouseLeave={handleTitleLeave}
			>
				{log.title ?? "--"}

				{bttCopyVisible && (
					<TooltipWrapCmp className={`${cls.boxCopy} ${clsBg}`}
						content="COPY"
					>
						<IconButton onClick={handleClipboardClick}>
							<CopyIcon />
						</IconButton>
					</TooltipWrapCmp>
				)}
			</div>

			<div className={cls.body}>
				{log.body ?? "--"}
			</div>

			{time && <div className={cls.footer}>{time}</div>}
		</div>
	)
}

export default ItemRow
