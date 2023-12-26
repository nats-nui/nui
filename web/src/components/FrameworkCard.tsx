import { VIEW_SIZE, ViewStore } from "@/stores/docs/viewBase"
import { FunctionComponent } from "react"
import Header from "./Header"
import ActionGroup from "./buttons/ActionGroup"
import layoutSo from "@/stores/layout"
import { ANIM_TIME_CSS, DOC_ANIM } from "@/types"



interface Props {
	store: ViewStore
	style?: React.CSSProperties
	actionsRender?: React.ReactNode
	children: React.ReactNode
}

/** struttura standard di una CARD */
const FrameworkCard: FunctionComponent<Props> = ({
	store,
	actionsRender,
	children,
}) => {

	// RENDER
	const inRoot = !store.state.parent
	const isIconized = store.state.size == VIEW_SIZE.ICONIZED
	const variant = store.getColorBg()
	const inDrag = store.state.docAnim == DOC_ANIM.DRAGGING

	return <div style={cssRoot(variant, inDrag)}>

		<Header store={store} />

		{!isIconized ? (<>

			<ActionGroup 
				style={{ marginLeft: !inRoot? 7 : null }}
			>
				{actionsRender}
			</ActionGroup>

			<div style={cssChildren(inRoot)}>
				{children}
			</div>

		</>) : (
			null
		)}
	</div>
}

export default FrameworkCard

const cssRoot = (variant: number, inDrag:boolean): React.CSSProperties => ({
	position: "relative",
	flex: 1,
	display: "flex",
	flexDirection: "column",
	height: "100%",

	backgroundColor: layoutSo.state.theme.palette.var[variant]?.bg,
	color: layoutSo.state.theme.palette.var[variant]?.fg,
	
	transition: `opacity ${ANIM_TIME_CSS}ms`,
	opacity: inDrag ? .5 : null,
})

const cssChildren = (inRoot: boolean): React.CSSProperties => ({
	marginLeft: inRoot ? 0 : 15,
	flex: 1,
	overflowY: "auto",
	padding: 10,
})