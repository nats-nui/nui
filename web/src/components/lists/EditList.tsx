import IconButton from "@/components/buttons/IconButton"
import AddIcon from "@/icons/AddIcon"
import { useState, FunctionComponent, forwardRef, LegacyRef } from "react"



export interface RenderRowBaseProps<T> {
	item: T
	isSelect?: boolean
	readOnly?: boolean
	onChange?: (newItem: T) => void
	onSelect?: (e: React.SyntheticEvent) => void
}

interface Props<T> {
	items: T[]
	/** renderizza una ROW ITEM in lista */
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	variant?: number
	readOnly?: boolean
	style?: React.CSSProperties

	/** restituisce nuovo ITEM (su click btt NEW) */
	fnNewItem?: () => T
	onChangeItems?: (newItems: T[]) => void
	onSelect?: (index: number, e: React.BaseSyntheticEvent) => void
	
	ref?:LegacyRef<HTMLDivElement>
}

function EditList<T>({
	items,
	RenderRow,
	variant = 0,
	readOnly = false,
	style,

	fnNewItem = () => null,
	onChangeItems,
	onSelect,

}: Props<T>, ref: LegacyRef<HTMLDivElement>) {

	// STORES

	// HOOKS
	const [indexSelect, setIndexSelect] = useState(-1)

	// HANDLERS
	const handleChangeItem = (newItem: T, index: number) => {
		if (readOnly) return
		const newItems = [...items]
		if (newItem == null) {
			newItems.splice(index, 1)
			setIndexSelect(index >= items.length ? items.length - 1 : index)
		} else {
			newItems[index] = newItem
		}
		onChangeItems?.(newItems)
	}
	const handleNewItem = (index?: number, e?:any) => {
		if (readOnly) return
		const newItem = fnNewItem()
		if (index == null) index = items.length
		items.splice(index, 0, newItem)
		onChangeItems?.([...items])
		handleSelect(index, e)
		//setIndexSelect(index)

	}
	const handleSelect = (index: number, e: React.BaseSyntheticEvent) => {
		setIndexSelect(index)
		onSelect?.(index, e)
	}
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (indexSelect == -1) return
		let newFocus = indexSelect
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault()
				newFocus--
				break
			case 'ArrowDown':
				event.preventDefault()
				newFocus++
				break
			case "Enter":
				event.preventDefault()
				handleNewItem(indexSelect + 1)
				return
		}
		if (newFocus < 0) newFocus = 0
		if (newFocus >= items.length) newFocus = items.length - 1
		setIndexSelect(newFocus)
	}
	const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		const isChild = e.currentTarget.contains(e.relatedTarget)
		if (!isChild) setIndexSelect(-1)
	}

	// RENDER
	return (
		<div  
			//tabIndex={0}
			ref={ref}
			style={{ ...cssRoot(variant, readOnly), ...style }}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
		>
			{/* LISTA */}
			{items?.map((item, index) => (
				<RenderRow key={index}
					item={item}
					isSelect={indexSelect == index}
					readOnly={readOnly}
					onChange={(newItem) => handleChangeItem(newItem, index)}
					onSelect={(e) => handleSelect(index, e)}
				/>
			))}

			{/* BOTTONE NEW */}
			{!readOnly && fnNewItem && (
				<IconButton style={{ backgroundColor: '#00000010', }}
					onClick={(e) => handleNewItem(null, e)}
				><AddIcon /></IconButton>
			)}
		</div>
	)
}

export default forwardRef(EditList) as <T>(props: Props<T>, ref: LegacyRef<HTMLDivElement>) => JSX.Element

const cssRoot = (variant: number, readOnly: boolean): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
	borderRadius: 5,
})

const cssButton:React.CSSProperties = {
	backgroundColor: '#00000010',
	borderRadius: 3,
}
