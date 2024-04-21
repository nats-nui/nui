import CloseIcon from "@/icons/CloseIcon"
import InfoIcon from "@/icons/InfoIcon"
import SkullIcon from "@/icons/SkullIcon"
import WarnIcon from "@/icons/WarnIcon"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import TooltipWrapCmp from "../tooltip/TooltipWrapCmp"
import IconButton from "../buttons/IconButton"
import cls from "./SnackbarCmp.module.css"
import SuccessIcon from "@/icons/SuccessIcon"



interface Props {
	view?: ViewStore
}

/** Il contenitore CARD. Gestisce il drag e posizionamento del DECK */
const SnackbarCmp: FunctionComponent<Props> = ({
	view,
}) => {

	// STORES
	const viewSa = useStore(view) as ViewState
	const { open, title, body, type, timeout } = viewSa.snackbar
	const [hide, setHide] = useState(true)

	// HOOKS
	useEffect(() => {
		let timeoutId = null
		if (open) {
			setHide(false)
			if (timeout) timeoutId = setTimeout(handleClose, timeout)
		} else {
			setTimeout(() => setHide(true), 300)
		}
		return () => clearTimeout(timeoutId)
	}, [open])

	// HANDLER
	const handleClose = () => {
		view.setSnackbar({ ...view.state.snackbar, open: false })
	}

	// RENDER
	const inRoot = !view.state.parent
	const clsRootFrame = viewSa.size == VIEW_SIZE.COMPACT ? cls.root_icon : cls.root
	const clsRoot = `${clsRootFrame} ${open ? cls.open : cls.close} ${hide ? cls.hide : ""} ${cls[type]}`
	const icon = useMemo(() => ({
		[MESSAGE_TYPE.INFO]: <InfoIcon className={cls.icon} />,
		[MESSAGE_TYPE.SUCCESS]: <SuccessIcon className={cls.icon} />,
		[MESSAGE_TYPE.WARNING]: <WarnIcon className={cls.icon} />,
		[MESSAGE_TYPE.ERROR]: <SkullIcon className={cls.icon} />,
	}[type]), [type])

	if (viewSa.size == VIEW_SIZE.COMPACT) {
		const stl = { marginLeft: !inRoot ? 3 : null }
		return (
			<TooltipWrapCmp content={title}>
				<div className={clsRoot} style={stl}
					onClick={handleClose}
				>{icon}</div>
			</TooltipWrapCmp>
		)
	}

	return (
		<div className={clsRoot}>
			<div className={cls.header}>
				{icon}
				<div className={cls.title}>{title}</div>
				<div style={{ flex: 1 }} />
				<IconButton onClick={handleClose}>
					<CloseIcon />
				</IconButton>
			</div>
			<div className={cls.body}>
				{body}
			</div>
		</div>
	)
}

export default SnackbarCmp
