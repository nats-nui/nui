import { useState } from "react"



interface Props<T> {
	items: T[]
	fnLabel: (item: T) => string
	fnNewItem: () => T
	renderDetail?: React.ReactNode

	onChange?: (newItems: T[]) => void
	onClose?: () => void
}

function ListEditDlg<T>({
	items,
	fnLabel = (item) => item?.toString() ?? "",
	fnNewItem,
	renderDetail,

	onChange,
	onClose,
}: Props<T>) {

	// STORES
	//const cnnDetailSa = useStore(parentSo) as CnnDetailState

	// HOOKS
	const [select, setSelect] = useState<number>(null)

	// HANDLERS
	const handleSelect = (index: number) => {
		setSelect(index)
	}
	const handleChangeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newItems = [...items]
		newItems[select] = e.target.value as any
		onChange?.(newItems)
	}
	const handleDelete = () => {
		const newItems = [...items]
		newItems.splice(select, 1)
		onChange?.(newItems)
	}
	const handleNew = () => {
		const newItem = fnNewItem()
		const newItems = [...items, newItem]
		setSelect(newItems.length - 1)
		onChange?.(newItems)
	}
	const handleClose = () => onClose()

	// RENDER
	//if (!cnnDetailSa.connection) return null
	const itemSel = items[select]

	return <div style={cssContainer}>

		<div onClick={handleClose}>X</div>

		{items?.map((item, index) =>
			<div key={index} style={{ backgroundColor: index == select ? "red" : null }}
				onClick={() => handleSelect(index)}
			>{fnLabel(item)}</div>
		)}

		{itemSel != null && <>
			{renderDetail || (
				<input
					value={fnLabel(itemSel)}
					onChange={handleChangeSelect}
				/>
			)}

			<button
				onClick={handleDelete}
			>DELETE</button>
		</>}

		<button onClick={handleNew}>NEW</button>
	</div>
}

export default ListEditDlg

const cssContainer: React.CSSProperties = {
	paddingLeft: "15px",
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: "#a0e312",
	color: "black",
	width: "146px",
}

// { height: "100%", width: "200px", backgroundColor: "red", paddingLeft: "10px" }