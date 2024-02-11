import { FunctionComponent, useRef, useState } from "react"
import ListRow from "./ListRow"
import IconButton from "../buttons/IconButton"
import AddIcon from "@/icons/AddIcon"
import Component from "../format/Component"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { ViewStore } from "@/stores/stacks/viewBase"
import ElementDialog from "../dialogs/ElementDialog"




interface Props<T> {
	store: ViewStore
	items: T[]
	readOnly?: boolean

	renderLabel: (item: T, index?: number) => React.ReactNode
	renderForm: (item:T)=> React.ReactNode

	style?: React.CSSProperties
}

function LiastDialog<T>({
	store,
	items,
	readOnly,

	renderLabel,
	renderForm,

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

			{items?.map((item, index) => <Component
				onClick={(e) => handleRowClick(index, e)}
				enterRender={<ArrowRightIcon style={{ opacity: 0.5 }} />}
			>
				{renderLabel(item, index)}
			</Component>)}

			{!readOnly && (
				<IconButton style={{ backgroundColor: '#00000010', }}
					onClick={handleNew}
				><AddIcon /></IconButton>
			)}
		</div>

		<ElementDialog
			element={elementSource}
			store={store}
			width={150}
			onClose={(e) => {
				if (ref && ref.current.contains(e.target)) return
				setElementSource(null)
			}}
		>
			{renderForm(itemSelect)}
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