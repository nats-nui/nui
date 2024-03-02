import IconButton from "@/components/buttons/IconButton"
import AddIcon from "@/icons/AddIcon"
import { useState, FunctionComponent, forwardRef, LegacyRef, useEffect } from "react"

export enum LIST_ACTIONS {
	DELETE,
	UPDATE,
	NEW
}

/** le PROPS da implementare per il componente di rendering della ROW */
export interface RenderRowBaseProps<T> {
	item: T
	isSelect?: boolean
	readOnly?: boolean
	onChange?: (newItem: T) => void
	onSelect?: (e: React.SyntheticEvent) => void
}

interface Props<T> {
	items: T[]
	select?: number
	/** renderizza una ROW ITEM in lista */
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	variant?: number
	readOnly?: boolean
	keepSelectOnBlur?: boolean
	style?: React.CSSProperties

	/** restituisce nuovo ITEM (su click btt NEW) */
	onNewItem?: (index: number) => T
	onItemsChange?: (newItems: T[], action?: LIST_ACTIONS) => void
	onSelectChange?: (index: number, e: React.BaseSyntheticEvent) => void

	ref?: LegacyRef<HTMLDivElement>
}

function EditList<T>({
	items,
	select,
	RenderRow,
	variant = 0,
	readOnly = false,
	keepSelectOnBlur,
	style,

	onNewItem,
	onItemsChange,
	onSelectChange,

}: Props<T>, ref: LegacyRef<HTMLDivElement>) {

	// STORES

	// HOOKS
	const [indexSelect, _setIndexSelect] = useState(-1)
	const getIndexSelect = () => select == undefined ? indexSelect : select
	const setIndexSelect = (index: number, e?: React.BaseSyntheticEvent) => {
		if (select == undefined) _setIndexSelect(index)
		onSelectChange?.(index, e)
	}

	// HANDLERS

	const handleChangeItem = (newItem: T, index: number) => {
		if (readOnly) return
		const newItems = [...items]
		if (newItem == null) {
			newItems.splice(index, 1)
			onItemsChange?.(newItems, LIST_ACTIONS.DELETE)
		} else {
			newItems[index] = newItem
			onItemsChange?.(newItems, LIST_ACTIONS.UPDATE)
		}
	}

	const handleNewItem = (index?: number, e?: any) => {
		if (readOnly) return
		if (index == null) index = items.length
		const newItem = onNewItem(index)
		if (newItem == null) return
		items.splice(index, 0, newItem)
		onItemsChange?.([...items], LIST_ACTIONS.NEW)
		handleSelect(index, e)
	}

	const handleSelect = (index: number, e: React.BaseSyntheticEvent) => {
		//if (index == getIndexSelect()) index = -1
		setIndexSelect(index, e)
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (getIndexSelect() == -1) return
		let newFocus = getIndexSelect()
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
				handleNewItem(getIndexSelect() + 1)
				return
		}
		if (newFocus < 0) newFocus = 0
		if (newFocus >= items.length) newFocus = items.length - 1
		setIndexSelect(newFocus)
	}

	const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		if ( keepSelectOnBlur ) return 
		const isChild = e.currentTarget.contains(e.relatedTarget)
		if (!isChild) setIndexSelect(-1)
	}

	// RENDER
	if (!items) return null
	return (
		<div
			tabIndex={0}
			ref={ref}
			style={{ ...cssRoot(variant, readOnly), ...style }}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
		>
			{/* LISTA */}
			{items?.length > 0 ? items.map((item, index) =>
				<RenderRow key={index}
					item={item}
					isSelect={getIndexSelect() == index}
					readOnly={readOnly}
					onChange={(newItem) => handleChangeItem(newItem, index)}
					onSelect={(e) => handleSelect(index, e)}
				/>
			) : readOnly ? <div>empty</div> : null}

			{/* BOTTONE NEW */}
			{!readOnly && onNewItem && (
				<IconButton style={{ backgroundColor: '#00000010', }}
					onClick={(e) => handleNewItem(null, e)}
				><AddIcon /></IconButton>
			)}
		</div>
	)
}

export default forwardRef(EditList) as <T>(props: Props<T>, ref: LegacyRef<HTMLDivElement>) => JSX.Element

const cssRoot = (variant: number, readOnly: boolean): React.CSSProperties => ({
	// display: "flex",
	// flexDirection: "column",
	borderRadius: 5,
})

const cssButton: React.CSSProperties = {
	backgroundColor: '#00000010',
	borderRadius: 3,
}
