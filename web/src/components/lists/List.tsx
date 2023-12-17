import { FunctionComponent } from "react"



export interface RenderRowBaseProps<T> {
	item: T
	isSelect?: boolean
}

interface Props<T> {
	items: T[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>

	select?: number
	onChangeSelect?: (index: number) => void
	style?: React.CSSProperties
}

function List<T>({
	items,
	RenderRow,

	select,
	onChangeSelect,
	style = {},
}: Props<T>) {

	// STORES

	// HOOKS

	// HANDLERS
	const handleSelect = (index: number) => {
		onChangeSelect?.(index)
	}

	// RENDER
	if (!items) return null

	return <div style={{ ...cssContainer, ...style }}>

		{items.map((item, index) =>
			<div
				key={index}
				style={cssRow(select == index)}
				onClick={() => handleSelect(index)}
			>
				<RenderRow
					item={item}
					isSelect={index == select}
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

const cssRow = (select: boolean): React.CSSProperties => ({
	backgroundColor: select ? "#0000001c" : null
})