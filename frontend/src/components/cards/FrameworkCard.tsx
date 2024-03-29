import CloseIcon from "@/icons/CloseIcon"
import DetachIcon from "@/icons/DetachIcon"
import docsSo from "@/stores/docs"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_ANIM } from "@/types"
import { FunctionComponent } from "react"
import ActionGroup from "../buttons/ActionGroup"
import IconButton from "../buttons/IconButton"
import ErrorBoundary from "./ErrorBoundary"
import cls from "./FrameworkCard.module.css"
import Header from "./Header"



interface Props {
	store: ViewStore
	style?: React.CSSProperties
	styleBody?: React.CSSProperties
	variantBg?: boolean
	actionsRender?: React.ReactNode
	iconizedRender?: React.ReactNode
	children: React.ReactNode
}

/** struttura standard di una CARD */
const FrameworkCard: FunctionComponent<Props> = ({
	store,
	style,
	styleBody,
	variantBg,
	actionsRender,
	iconizedRender,
	children,
}) => {

	// HANDLER
	const handleClose = () => store.onRemoveFromDeck()
	const handleDetach = () => docsSo.detach(store)

	// RENDER
	const inRoot = !store.state.parent
	const isIconized = store.state.size == VIEW_SIZE.COMPACT
	const inDrag = store.state.docAnim == DOC_ANIM.DRAGGING
	const clsRoot = `${cls.root} ${variantBg ? "color-bg color-text" : ""} ${!inRoot ? cls.linked : ""} ${inDrag ? cls.drag : ""} ${isIconized ? cls.iconized : ""}`

	return <div className={clsRoot} style={style} >

		<Header store={store} />

		<ErrorBoundary>

			{isIconized ? <>
				<ActionGroup 
					//className={cls.actions}
					className={`${cls.actions} ${cls.hovercontainer}`}
				>

					<IconButton
						onClick={handleClose}
					><CloseIcon /></IconButton>

					<IconButton className={`${cls.btt} color-bg ${cls.hovershow}`}
						onClick={handleDetach}
					><DetachIcon /></IconButton>

				</ActionGroup>
				{iconizedRender}
			</> : <>
				<ActionGroup>
					{actionsRender}
				</ActionGroup>

				<div className={cls.children} style={styleBody}>
					{children}
				</div>
			</>}

		</ErrorBoundary>

	</div>
}

export default FrameworkCard
