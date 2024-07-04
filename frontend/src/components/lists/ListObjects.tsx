export { ListObjects as default,  } from "@priolo/jack"
export type { RenderFormProps, RenderLabelProps } from "@priolo/jack"


// import AddIcon from "@/icons/AddIcon"
// import CloseIcon from "@/icons/CloseIcon"
// import { ViewStore } from "@/stores/stacks/viewBase"
// import { FunctionComponent, useRef, useState } from "react"
// import IconButton from "../buttons/IconButton"
// import ElementDialog from "../dialogs/ElementDialog"
// import Component from "../format/Component"



// export interface RenderFormProps<T> {
// 	item: T
// 	index?: number
// 	onClose?: () => void
// }

// export interface RenderLabelProps<T> {
// 	item: T
// 	index?: number
// }

// interface Props<T> {
// 	store: ViewStore
// 	items: T[]
// 	readOnly?: boolean
// 	width?: number

// 	/** renderizza la riga che appare in lista */
// 	RenderLabel?: FunctionComponent<RenderLabelProps<T>>
// 	/** renderizza la form che appare nella DIALOG. "onClose" permette di chiudere la DIALOG */
// 	RenderForm?: FunctionComponent<RenderFormProps<T>>
// 	onDelete: (index: number) => void

// 	style?: React.CSSProperties
// }

// function ListObjects<T>({
// 	store,
// 	items,
// 	readOnly,
// 	width = 150,

// 	RenderLabel,
// 	RenderForm,
// 	onDelete,

// 	style,
// }: Props<T>) {

// 	// STORES

// 	// HOOKS
// 	const ref = useRef(null)
// 	const [elementSource, setElementSource] = useState<HTMLElement>(null)
// 	const [sourceIndex, setSourceIndex] = useState<number>(null)

// 	// HANDLERS
// 	const handleRowClick = (index: number, e: React.MouseEvent) => {
// 		setSourceIndex(index)
// 		setElementSource(e.target as HTMLElement)
// 	}
// 	const handleNew = (e: React.MouseEvent) => {
// 		setSourceIndex(-1)
// 		setElementSource(e.target as HTMLElement)
// 	}
// 	const handleOnClose = () => {
// 		setSourceIndex(-1)
// 		setElementSource(null)
// 	}

// 	// RENDER
// 	if (!items) items = []
// 	const itemSelect = items[sourceIndex]

// 	return <>
// 		<div style={style} ref={ref}>

// 			{/* LIST */}
// 			{items.length > 0 ? items.map((item, index) =>
// 				<Component key={index}
// 					selected={index == sourceIndex}
// 					onClick={(e) => handleRowClick(index, e)}
// 					enterRender={!readOnly && <CloseIcon onClick={() => onDelete(index)} />}
// 					readOnly={readOnly}
// 				>
// 					<RenderLabel item={item} index={index} />
// 				</Component>
// 			) : readOnly ? <div className="lbl-empty lbl-disabled">EMPTY LIST</div> : null}

// 			{/* NEW BUTTON */}
// 			{!readOnly && (
// 				<IconButton style={{ backgroundColor: '#00000010', }}
// 					onClick={handleNew}
// 				><AddIcon /></IconButton>
// 			)}

// 		</div>

// 		<ElementDialog
// 			element={elementSource}
// 			store={store}
// 			width={width}
// 			title="AUTH"
// 			onClose={(e) => {
// 				if (ref && ref.current.contains(e.target)) return
// 				setSourceIndex(-1)
// 				setElementSource(null)
// 			}}
// 		>
// 			<RenderForm
// 				item={itemSelect}
// 				index={sourceIndex}
// 				onClose={handleOnClose}
// 			/>
// 		</ElementDialog>
// 	</>
// }

// export default ListObjects
