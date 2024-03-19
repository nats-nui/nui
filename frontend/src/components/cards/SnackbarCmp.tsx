import CloseIcon from "@/icons/CloseIcon"
import SkullIcon from "@/icons/SkullIcon"
import { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"
import IconButton from "../buttons/IconButton"
import classes from "./SnackbarCmp.module.css"
import InfoIcon from "@/icons/InfoIcon"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import WarnIcon from "@/icons/WarnIcon"



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
	const clsRoot = `${classes.root} ${open ? classes.open : classes.close} ${hide ? classes.hide : ""} ${classes[type]}`
	const icon = {
		[MESSAGE_TYPE.INFO]: <InfoIcon className={classes.icon} />,
		[MESSAGE_TYPE.WARNING]: <WarnIcon className={classes.icon} />,
		[MESSAGE_TYPE.ERROR]: <SkullIcon className={classes.icon} />,
	}[type]

	return (
		<div className={clsRoot}>
			<div className={classes.header}>
				{icon}
				<div className={classes.title}>{title}</div>
				<div style={{ flex: 1 }} />
				<IconButton onClick={handleClose}>
					<CloseIcon />
				</IconButton>
			</div>
			<div className={classes.body}>
				{body}
			</div>
		</div>
	)
}

export default SnackbarCmp
