import ArrowDownIcon from "@/icons/ArrowDownIcon"
import { FunctionComponent, useState } from "react"
import Accordion from "./Accordion"
import Component from "./format/Component"
import { RenderRowBaseProps } from "./lists/EditList"
import List from "./lists/List"
import Divider from "./format/Divider"



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
				enterRender={<ArrowDownIcon style={{ opacity: .5 }} />}
			>{label}</Component>

			<Accordion
				height={height}
				open={open}
			>
				<List<T> style={{ flex: 1, marginTop: 5 }}
					select={index}
					items={items}
					RenderRow={RenderRow}
					readOnly={readOnly}
					onSelect={handleSelect}
				/>
			</Accordion>
			{ open &&
				<div style={{ width: "100%", borderBottom: "2px dashed rgb(0 0 0 / 35%)", marginTop: 5, }} />
			}
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

