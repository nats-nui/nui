import AddIcon from "@/icons/AddIcon"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useRef, useState } from "react"
import IconButton from "../buttons/IconButton"
import ElementDialog from "../dialogs/ElementDialog"
import Component from "../format/Component"
import CloseIcon from "@/icons/CloseIcon"




interface Props<T> {
	store: ViewStore
	items: T[]
	readOnly?: boolean

	renderLabel: (item: T, index?: number) => React.ReactNode
	renderForm: (item: T, index: number, onClose: () => void) => React.ReactNode
	onDelete: (index: number) => void

	style?: React.CSSProperties
}

function LiastDialog<T>({
	store,
	items,
	readOnly,

	renderLabel,
	renderForm,
	onDelete,

	style,
}: Props<T>) {

	// STORES

	// HOOKS
	const ref = useRef(null)
	const [elementSource, setElementSource] = useState<HTMLElement>(null)
	const [souceIndex, setSourceIndex] = useState<number>(null)

	// HANDLERS
	const handleRowClick = (index: number, e: React.MouseEvent) => {
		setSourceIndex(index)
		setElementSource(e.target as HTMLElement)
	}
	const handleNew = (e: React.MouseEvent) => {
		setSourceIndex(-1)
		setElementSource(e.target as HTMLElement)
	}
	const handleOnClose = () => {
		setSourceIndex(-1)
		setElementSource(null)
	}

	// RENDER
	if (!items) return null
	const itemSelect = items[souceIndex]

	return <>
		<div
			//tabIndex={0}
			ref={ref}
		//style={{ ...cssRoot(variant, readOnly), ...style }}
		//onKeyDown={handleKeyDown}
		//onBlur={handleBlur}
		>
			{items?.map((item, index) => (
				<Component key={index}
					selected={index == souceIndex}
					onClick={(e) => handleRowClick(index, e)}
					enterRender={!readOnly && <CloseIcon onClick={() => onDelete(index)} />}
					readOnly={readOnly}
				>
					{renderLabel(item, index)}
				</Component>)
			)}

			{!readOnly && (
				<IconButton style={{ backgroundColor: '#00000010', }}
					onClick={handleNew}
				><AddIcon /></IconButton>
			)}
		</div>

		<ElementDialog
			element={elementSource}
			store={store}
			//width={150}
			title="AUTH"
			onClose={(e) => {
				if (ref && ref.current.contains(e.target)) return
				setSourceIndex(-1)
				setElementSource(null)
			}}
		>
			{renderForm(itemSelect, souceIndex, handleOnClose)}
		</ElementDialog>
	</>
}

export default LiastDialog

const cssContainer = (height: number): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
	...height && {
		height: height,
		overflowY: "auto",
	},
})