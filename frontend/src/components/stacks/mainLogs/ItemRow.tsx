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
				<div style={{ flex: 1 }}>{log.title ?? "--"}</div>
				{bttCopyVisible && (
					<TooltipWrapCmp content="COPY" variant={COLOR_VAR.CYAN}>
						<IconButton onClick={handleClipboardClick}>
							<CopyIcon />
						</IconButton>
					</TooltipWrapCmp>
				)}
			</div>

			{log.body ?? "--"}

			{time && <div style={cssFooter}>{time}</div>}
		</div>
	)
}

export default ItemRow

const cssRoot = (index: number, type: MESSAGE_TYPE): React.CSSProperties => {
	const [col1, col2] = {
		[MESSAGE_TYPE.INFO]: [layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg, layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg2],
		[MESSAGE_TYPE.ERROR]: [layoutSo.state.theme.palette.var[COLOR_VAR.FUCHSIA].bg, layoutSo.state.theme.palette.var[COLOR_VAR.FUCHSIA].bg],
		[MESSAGE_TYPE.WARNING]: [layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg, layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg],
	}[type] ?? [layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg, layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg2]

	return {
		backgroundColor: index % 2 == 0 ? col1 : col2,
		display: "flex",
		flexDirection: "column",
		padding: "0px 7px 5px 7px",
	}
}

const cssTitle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	height: 24,
	fontSize: 10,
}

const cssTitleText: React.CSSProperties = {
	flex: 1,
	color: layoutSo.state.theme.palette.default.fg2,
}

const cssFooter: React.CSSProperties = {
	fontSize: 10,
	opacity: .7,
	alignSelf: "flex-end",
}