import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import CopyIcon from "@/icons/CopyIcon"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { MESSAGE_TYPE, Log } from "@/stores/log/utils"
import dayjs from "dayjs"
import { FunctionComponent, useMemo, useState } from "react"



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

	return (
		<div style={cssRoot(index, log.type)}
			onClick={handleClick}
		>
			<div style={cssTitle}
				onMouseEnter={handleTitleEnter}
				onMouseLeave={handleTitleLeave}
			>
				{log.title ?? "--"}

				{bttCopyVisible && (
					<TooltipWrapCmp
						content="COPY"
						style={{ position: "absolute", top: 0, right: 0, backgroundColor: "gray", display: "flex" }}
					>
						<IconButton onClick={handleClipboardClick}>
							<CopyIcon />
						</IconButton>
					</TooltipWrapCmp>
				)}
			</div>

			<div style={cssBody}>
				{log.body ?? "--"}
			</div>

			{time && <div style={cssFooter}>{time}</div>}
		</div>
	)
}

export default ItemRow

const cssRoot = (index: number, type: MESSAGE_TYPE): React.CSSProperties => {
	const color = { 
		[MESSAGE_TYPE.ERROR] : layoutSo.state.theme.palette.var[COLOR_VAR.FUCHSIA].bg,
		[MESSAGE_TYPE.WARNING] : layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,
	}[type] ?? "transparent"

	return {
		backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT][index % 2 == 0 ? "bg" : "bg2"],
		borderLeft: `2px solid ${color}`,
		display: "flex",
		flexDirection: "column",
		padding: "0px 7px 0px 10px",
		margin: "20px 0px"
	}
}

const cssTitle: React.CSSProperties = {
	position: "relative",
	display: "flex",
	alignItems: "center",
	fontSize: 14,
	fontWeight: 600,
	marginBottom: 5,
}

const cssBody: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 400,
	overflowWrap: 'break-word',
}

const cssFooter: React.CSSProperties = {
	marginTop: 5,
	fontSize: 10,
	opacity: .7,
	alignSelf: "flex-end",
}