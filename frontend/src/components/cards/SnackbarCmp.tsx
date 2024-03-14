import SkullIcon from "@/icons/SkullIcon"
import { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useState } from "react"
import IconButton from "../buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import layoutSo, { COLOR_VAR } from "@/stores/layout"



interface Props {
	view?: ViewStore
}

/** Il contenitore CARD. Gestisce il drag e posizionamento del DECK */
const SnackbarCmp: FunctionComponent<Props> = ({
	view,
}) => {

	// STORES
	const viewSa = useStore(view) as ViewState
	const { open, title, body, type } = viewSa.snackbar
	const [hide, setHide] = useState(true)

	// HOOKS
	useEffect(() => {
		if (open) {
			setHide(false)
		} else {
			setTimeout(() => setHide(true), 300)
		}
	}, [open])

	// HANDLER
	const handleClose = () => {
		view.setSnackbar({ ...view.state.snackbar, open: false })
	}

	// RENDER
	return (
		<div style={cssRoot(open, hide, type)}>
			<div style={{}}>
				<SkullIcon />
			</div>
			<div style={cssBody}>
				<div>{title}</div>
				<div>{body}</div>
			</div>
			<IconButton>
				<CloseIcon onClick={handleClose} />
			</IconButton>
		</div>
	)
}

export default SnackbarCmp

const cssRoot = (open: boolean, hide: boolean, type: MESSAGE_TYPE): React.CSSProperties => ({
	position: "absolute",
	left: 0, right: 0,
	margin: 15,
	padding: 5,
	borderRadius: 7,
	backgroundColor: {
		[MESSAGE_TYPE.INFO]: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
		[MESSAGE_TYPE.ERROR]: layoutSo.state.theme.palette.var[COLOR_VAR.FUCHSIA].bg,
		[MESSAGE_TYPE.WARNING]: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,
	}[type] ?? layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	display: "flex",

	transition: 'bottom 300ms cubic-bezier(0.5, 0, 0, 1), opacity 300ms linear',
	transform: hide ? "scale(0,0)": null,
	...open ? {
		bottom: 0,
		opacity: 1,
	} : {
		bottom: -100,
		opacity: 0,
	}

})

const cssBody: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",

}