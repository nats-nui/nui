import { FunctionComponent, useState } from "react"
import Accordion from "./Accordion"
import EditList, { RenderRowBaseProps } from "./lists/EditList"
import List from "./lists/List"



interface Props<T> {
	value: T
	items: T[]
	RenderRow: FunctionComponent<RenderRowBaseProps<T>>
	style: React.CSSProperties
	onSelect?: (value: T) => void
}

function Options<T>({
	value,
	items,
	RenderRow,
	style,
	onSelect,
}: Props<T>) {

	// STORE

	// HOOK
	const [open, setOpen] = useState(false)

	// HANDLER
	const handleOpen = () => {
		setOpen(!open)
	}
	const handleSelect = (index:number) => {
		onSelect?.(items[index])
		setOpen(false)
	}

	// RENDER
	return (
		<div style={style}>
			<div
				onClick={handleOpen}
			>{value.toString()}</div>
			<Accordion
				open={open}
			>
				<List
					items={items}
					RenderRow={RenderRow}
					onSelect={handleSelect}
				/>
			</Accordion>
		</div>
	)
}

export default Options
