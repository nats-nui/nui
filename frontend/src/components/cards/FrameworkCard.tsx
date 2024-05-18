import CloseIcon from "@/icons/CloseIcon"
import DetachIcon from "@/icons/DetachIcon"
import docsSo from "@/stores/docs"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_ANIM } from "@/types"
import { FunctionComponent } from "react"
import IconButton from "../buttons/IconButton"
import ErrorBoundary from "./ErrorBoundary"
import cls from "./FrameworkCard.module.css"
import Header from "./Header"



interface Props {
	store: ViewStore
	style?: React.CSSProperties
	styleBody?: React.CSSProperties
	/** la variante colora il bg */
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
	const handleDetach = () => store.state.group.detach(store)

	// RENDER
	const inZen = docsSo.state.zenCard == store
	const inRoot = inZen || !store.state.parent
	const isIconized = store.state.size == VIEW_SIZE.COMPACT
	const inDrag = store.state.docAnim == DOC_ANIM.DRAGGING
	const clsRoot = `${cls.root} ${variantBg ? "color-bg color-text" : ""} ${!inRoot ? cls.linked : ""} ${inDrag ? cls.drag : ""} ${isIconized ? cls.iconized : ""}`
	const clsChildren = `${cls.children} ${store.state.disabled ? cls.disabled : ""}`

	return <div className={clsRoot} style={style} >

		<Header store={store} />

		<ErrorBoundary>

			{isIconized ? <>
				<div
					className={`${cls.actions} ${cls.hovercontainer}`}
				>
					<IconButton
						onClick={handleClose}
					><CloseIcon /></IconButton>

					{!inRoot && (
						<IconButton
							className={`${cls.btt} color-bg ${cls.hovershow}`}
							onClick={handleDetach}
						><DetachIcon /></IconButton>
					)}

				</div>
				{iconizedRender}
			</> : <>
				<div className={cls.actions}>
					{actionsRender}
				</div>

				<div className={clsChildren} style={styleBody}>
					{children}
				</div>
			</>}

		</ErrorBoundary>

	</div>
}

export default FrameworkCard
