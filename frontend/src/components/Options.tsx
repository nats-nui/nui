import ArrowDownIcon from "@/icons/ArrowDownIcon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import Accordion from "./accordion/Accordion"
import cls from "./Options.module.css"
import Component from "./format/Component"
import TextInput from "./input/TextInput"
import { RenderRowBaseProps } from "./lists/EditList"
import List from "./lists/List"



interface Props {
	value: string
	items: string[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<string>>
	readOnly?: boolean
	height?: number
	style?: React.CSSProperties
	className?: string
	onSelect?: (value: string) => void
}

function Options<T>({
	value,
	items,
	RenderRow,
	readOnly = false,
	height,
	style,
	className,
	onSelect,
}: Props) {

	// STORE

	// HOOK
	const [open, setOpen] = useState(false)
	const [find, setFind] = useState(null)
	useEffect(() => {
		setFind(null)
	}, [open])

	// HANDLER
	const handleOpen = () => {
		setOpen(!open)
	}
	const handleSelect = (index: number) => {
		onSelect?.(itemsFilter[index])
		setOpen(false)
	}
	const handleFindChange = (newFind: string) => {
		setFind(newFind)
	}
	const handleFindKeyDown = (e:React.KeyboardEvent<HTMLInputElement>) => {
		switch (e.key) {
			case "Escape":
				setOpen(false)
				break
			case "Enter":
				if ( itemsFilter.length == 1 ) onSelect?.(itemsFilter[0])
				setOpen(false)
				break
		}
	}

	// RENDER
	const itemsFilter = useMemo(() => {
		if ( !find ) return items
		return items.filter(i => i.includes(find))
	}, [items, find])
	const index = items?.findIndex(i => i == value) ?? -1
	const label = value?.toString() ?? "--"

	if (readOnly) return (
		<div 
			className={`${cls.label} ${className}`} 
			style={style}
		>
			{label}
		</div>
	)

	return (
		<div className={`${cls.root} ${className}`} style={style}>

			{!open ? (
				<Component
					readOnly={readOnly}
					onClick={handleOpen}
					enterRender={<ArrowDownIcon style={{ opacity: .5 }} />}
				>{label}</Component>
			) : (
				<TextInput autoFocus
					readOnly={readOnly}
					value={find}
					onChange={handleFindChange}
					onKeyDown={handleFindKeyDown}
				/>
			)}

			<Accordion
				height={height}
				open={open}
			>
				<List<string> style={{ flex: 1, marginTop: 5 }}
					select={index}
					items={itemsFilter}
					RenderRow={RenderRow}
					readOnly={readOnly}
					onSelect={handleSelect}
				/>
			</Accordion>
			
			{open && <div className={cls.divider} />}

		</div>
	)
}

export default Options
