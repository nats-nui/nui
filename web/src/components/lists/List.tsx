import { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"



export interface RenderRowBaseProps<T> {
	item: T
	isSelect?: boolean
	variant?:number
}

interface Props<T> {
	items: T[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	variant?:number
	readOnly?:boolean
	/** indice selezionato */
	select?: number
	onSelect?: (index: number) => void
	style?: React.CSSProperties
}

function List<T>({
	items,
	RenderRow,
	variant = 0,
	readOnly,
	select,
	onSelect,
	style = {},
}: Props<T>) {

	// STORES

	// HOOKS

	// HANDLERS
	const handleSelect = (index: number) => {
		onSelect?.(index)
	}

	// RENDER
	if (!items) return null

	return <div style={{ ...cssContainer, ...style }}>

		{items.map((item, index) =>
			<div
				key={index}
				style={cssRow(select == index, variant)}
				onClick={() => handleSelect(index)}
			>
				<RenderRow
					item={item}
					isSelect={index == select}
					variant={variant}
				/>
			</div>
		)}

	</div>
}

export default List

const cssContainer: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}

const cssRow = (select: boolean, variant:number): React.CSSProperties => ({
	backgroundColor: select ? layoutSo.state.theme.palette.var[variant].bg : null,
	color: select ? layoutSo.state.theme.palette.var[variant].fg : null,
	cursor: !select ? "pointer" : null,
	fontSize: 12,
	fontWeight: 600,
	padding: "3px 5px",
	margin: "3px 3px",
})