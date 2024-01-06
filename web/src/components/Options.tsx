import { FunctionComponent, useState } from "react"
import Accordion from "./Accordion"
import { RenderRowBaseProps } from "./lists/EditList"
import List from "./lists/List"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import Divider from "./Divider"



interface Props<T> {
	value: T
	items: T[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	readOnly?: boolean
	variant?: number
	style?: React.CSSProperties
	onSelect?: (value: T) => void
}

function Options<T>({
	value,
	items,
	RenderRow,
	readOnly = false,
	variant = 0,
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
	const index = items.findIndex(i => i == value)
	const label = value?.toString() ?? "--"

	if (readOnly) return (
		<div style={cssLabelReadOnly}>
			{label}
		</div>
	)

	return (
		<div style={{ ...cssRoot(readOnly, variant), ...style }}>

			<div style={cssLabel}
				onClick={handleOpen}
			>{label}</div>

			<Accordion
				open={open}
			>
				<Divider variant={variant} />

				<List<T>
					select={index}
					items={items}
					RenderRow={RenderRow}
					variant={variant}
					readOnly={readOnly}
					onSelect={handleSelect}
				/>
			</Accordion>

		</div>
	)
}

export default Options

const cssRoot = (readOnly: boolean, variant: number): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
	...!readOnly ? {
		backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
		color: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].fg,
		borderRadius: 3,
	} : {},
})

const cssLabelReadOnly: React.CSSProperties = {
	padding: '5px 0px',
	fontSize: 12,
	fontWeight: 600,
}

const cssLabel: React.CSSProperties = {
	padding: '5px 7px',
	fontSize: 12,
	fontWeight: 600,
}