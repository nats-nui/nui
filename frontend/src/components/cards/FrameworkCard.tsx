import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent } from "react"
import Header from "./Header"
import ActionGroup from "../buttons/ActionGroup"
import layoutSo from "@/stores/layout"
import { ANIM_TIME_CSS, DOC_ANIM } from "@/types"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import IconButton from "../buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"



interface Props {
	store: ViewStore
	style?: React.CSSProperties
	styleBody?: React.CSSProperties
	variantBg?: number
	actionsRender?: React.ReactNode
	iconizedRender?: React.ReactNode
	children: React.ReactNode
}

/** struttura standard di una CARD */
const FrameworkCard: FunctionComponent<Props> = ({
	store,
	style,
	styleBody,
	variantBg = 0,
	actionsRender,
	iconizedRender,
	children,
}) => {

	// HANDLER
	const handleClose = () => store.onDestroy()

	// RENDER
	const inRoot = !store.state.parent
	const isIconized = store.state.size == VIEW_SIZE.COMPACT
	const inDrag = store.state.docAnim == DOC_ANIM.DRAGGING

	return <div style={{ ...cssRoot(variantBg, inDrag, isIconized, inRoot), ...style }}>

		<Header store={store} />

		{isIconized ? <>
			{/* <div style={{ height: 38, backgroundColor: "rgb(0 0 0 / 50%)", alignSelf: 'stretch' }} > */}
			<ActionGroup style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
				<IconButton
					onClick={handleClose}
				><CloseIcon /></IconButton>
			</ActionGroup>
			{/* </div> */}
			{iconizedRender}
		</> : <>
			<ActionGroup>
				{actionsRender}
			</ActionGroup>

			<div style={{ ...cssChildren, ...styleBody }}>
				{children}
			</div>
		</>}
	</div>
}

export default FrameworkCard

const cssRoot = (variant: number, inDrag: boolean, isIconized: boolean, inRoot: boolean): React.CSSProperties => ({
	position: "relative",
	flex: 1,
	display: "flex",
	flexDirection: "column",
	height: "100%",
	alignItems: isIconized ? "center" : null,
	paddingLeft: inRoot ? null : 8,

	backgroundColor: layoutSo.state.theme.palette.var[variant]?.bg,
	color: layoutSo.state.theme.palette.var[variant]?.fg,

	transition: `opacity ${ANIM_TIME_CSS}ms`,
	opacity: inDrag ? .5 : null,
})

const cssChildren: React.CSSProperties = {
	flex: 1,
	overflowY: "auto",
	padding: 10,
	display: "flex", flexDirection: "column",
}