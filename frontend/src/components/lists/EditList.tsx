import IconButton from "@/components/buttons/IconButton"
import AddIcon from "@/icons/AddIcon"
import { FunctionComponent, LegacyRef, forwardRef, useEffect, useState } from "react"
import cls from "./EditList.module.css"



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
	placeholder?: string
	onChange?: (newItem: T) => void
	onSelect?: (e: React.SyntheticEvent) => void
}

interface Props<T> {
	items: T[]
	select?: number
	/** renderizza una ROW ITEM in lista */
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	placeholder?: string
	readOnly?: boolean
	/** quando perde il fuoco seve mantenere la selezione (utile per le dialog) */
	keepSelectOnBlur?: boolean
	/** se riclicco sulla stessa row gia' selezionata la deseleziono */
	toggleSelect?: boolean
	style?: React.CSSProperties

	/** restituisce nuovo ITEM (su click btt NEW) */
	onNewItem?: (index: number) => T
	onItemsChange?: (newItems: T[], action?: LIST_ACTIONS) => void
	onSelectChange?: (index: number, e: React.BaseSyntheticEvent) => void

	fnIsVoid?: (item: T) => boolean

	ref?: LegacyRef<HTMLDivElement>
}

function EditList<T>({
	items,
	select,
	RenderRow,
	placeholder,
	readOnly = false,
	keepSelectOnBlur,
	toggleSelect,
	style,

	onNewItem,
	onItemsChange,
	onSelectChange,

	fnIsVoid,

}: Props<T>, ref: LegacyRef<HTMLDivElement>) {

	const clearVoid = () => {
		if (!fnIsVoid || !items || items.length == 0) return
		const itemsClear = items.filter(i => !fnIsVoid(i))
		onItemsChange(itemsClear)
	}

	// STORES

	// HOOKS
	const [_indexSelect, _setIndexSelect] = useState(-1)
	const indexSelect = select == undefined ? _indexSelect : select
	const setIndexSelect = (index: number, e?: React.BaseSyntheticEvent) => {
		if (select == undefined) _setIndexSelect(index)
		if (index == -1 && keepSelectOnBlur) clearVoid()
		onSelectChange?.(index, e)
	}
	useEffect(() => {
		if (indexSelect == -1 && keepSelectOnBlur) clearVoid()
	}, [indexSelect])

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
		if (index == indexSelect) {
			if (!toggleSelect) return
			index = -1
		}
		setIndexSelect(index, e)
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
		if (isChild) return
		if (!keepSelectOnBlur) {
			setIndexSelect(-1)
			clearVoid()
		}

	}

	// RENDER
	if (!items) items = []

	return (
		<div className={cls.root}
			tabIndex={0}
			ref={ref}
			style={style}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
		>
			{/* LIST */}
			{items.length > 0 ? items.map((item, index) =>
				<RenderRow key={index}
					item={item}
					placeholder={placeholder}
					isSelect={indexSelect == index}
					readOnly={readOnly}
					onChange={(newItem) => handleChangeItem(newItem, index)}
					onSelect={(e) => handleSelect(index, e)}
				/>
			) : readOnly ? <div className="lbl-empty lbl-disabled">EMPTY LIST</div> : null}

			{/* NEW BUTTON */}
			{!readOnly && onNewItem && (
				<IconButton className={cls.btt_new}
					onClick={(e) => handleNewItem(null, e)}
				><AddIcon /></IconButton>
			)}
		</div>
	)
}

export default forwardRef(EditList) as <T>(props: Props<T>, ref: LegacyRef<HTMLDivElement>) => JSX.Element
