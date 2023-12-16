import IconButton from "@/components/buttons/IconButton"
import AddIcon from "@/icons/AddIcon"
import { useState, FunctionComponent } from "react"



export interface RenderRowBaseProps<T> {
	item: T
	select?: boolean
	onChangeItem?: (newItem: T) => void
	onDelete?: ()=>void
}

interface Props<T> {
	items: T[]

	/** renderizza una ROW ITEM in lista */
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	/** restituisce nuovo ITEM (su click btt NEW) */
	fnNewItem?: () => T

	onChangeItems?: (newItems: T[]) => void
	onChangeSelect?: (index: number) => void

	style?: React.CSSProperties
}


function EditList<T>({
	items,

	RenderRow,
	fnNewItem,

	onChangeItems,
	onChangeSelect,

	style = {},
}: Props<T>) {

	// STORES

	// HOOKS
	const [select, setSelect] = useState<number>(null)

	// HANDLERS
	const handleSelect = (index: number) => {
		setSelect(index)
		onChangeSelect?.(index)
	}
	const handleChangeItem = (item: T) => {
		const newItems = [...items]
		newItems[select] = item
		onChangeItems?.(newItems)
	}
	const handleDeleteItem = (index:number) => {
		const newItems = [...items]
		newItems.splice(index, 1)
		onChangeItems?.(newItems)
	}
	const handleNewItem = () => {
		const newItem = fnNewItem()
		const newItems = [...items, newItem]
		setSelect(newItems.length - 1)
		onChangeItems?.(newItems)
	}


	// RENDER
	const itemSel = items[select]

	return <div style={{ ...cssContainer, ...style }}>

		{/* BOTTONE NEW */}
		{fnNewItem && (
			<IconButton onClick={handleNewItem}><AddIcon /></IconButton>
		)}

		{/* LISTA */}
		{items?.map((item, index) =>
			<div
				key={index}
				style={{ backgroundColor: index == select ? "red" : null }}
				onClick={() => handleSelect(index)}
			>
				<RenderRow 
					item={item} 
					select={item==items[index]}
					onChangeItem={handleChangeItem}
					onDelete={()=>handleDeleteItem(index)}
				/>
			</div>
		)}

		{/* SE é SELEZONATO UN ITEM... */}
		{/* {itemSel != null && RenderDetail && <>
			<RenderDetail item={itemSel} onChange={handleChangeSelect} />
			<button
				onClick={handleDelete}
			>DELETE</button>
		</>} */}


	</div>
}

export default EditList

const cssContainer: React.CSSProperties = {
	display: "flex", 
	flexDirection: "column",
	color: "black",
	width: "146px",
}
