import ArrowDown2Icon from "@/icons/ArrowDown2Icon"
import { FunctionComponent, useState } from "react"
import Accordion from "./Accordion"
import Component from "./format/Component"
import { RenderRowBaseProps } from "./lists/EditList"
import List from "./lists/List"



interface Props<T> {
	value: T
	items: T[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	readOnly?: boolean
	height?: number
	style?: React.CSSProperties
	onSelect?: (value: T) => void
}

function Options<T>({
	value,
	items,
	RenderRow,
	readOnly = false,
	height,
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
	const handleSelect = (index: number) => {
		onSelect?.(items[index])
		setOpen(false)
	}

	// RENDER
	const index = items?.findIndex(i => i == value) ?? -1
	const label = value?.toString() ?? "--"

	if (readOnly) return (
		<div style={cssLabelReadOnly}>
			{label}
		</div>
	)

	return (
		<div style={{ ...cssRoot(), ...style }}>

			<Component
				readOnly={readOnly}
				onClick={handleOpen}
				enterRender={<ArrowDown2Icon style={{ opacity: .5 }} />}
			>{label}</Component>

			<Accordion
				height={height}
				open={open}
			>


				<List<T>
					select={index}
					items={items}
					RenderRow={RenderRow}
					readOnly={readOnly}
					onSelect={handleSelect}
				/>
			</Accordion>

		</div>
	)
}

export default Options

const cssRoot = (): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
})

const cssLabelReadOnly: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
}

