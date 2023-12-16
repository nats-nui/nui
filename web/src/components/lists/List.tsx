import { useState, FunctionComponent } from "react"



export interface RenderRowBaseProps<T> {
	item: T
}

interface Props<T> {
	items: T[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	onChangeSelect?: (index: number) => void
	style?: React.CSSProperties
}

function List<T>({
	items,
	RenderRow,
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

	// RENDER
	const itemSel = items[select]

	return <div style={{ ...cssContainer, ...style }}>

		{items?.map((item, index) =>
			<div
				key={index}
				style={cssRow(select==index)}
				onClick={() => handleSelect(index)}
			>
				<RenderRow item={item} />
			</div>
		)}

	</div>
}

export default List

const cssContainer: React.CSSProperties = {
	display: "flex", 
	flexDirection: "column",
}

const cssRow = (select: boolean): React.CSSProperties => ({
	backgroundColor: select ? "#0000001c" : null
})