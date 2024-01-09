import { FunctionComponent } from "react"
import ListRow from "./ListRow"



export interface RenderRowBaseProps<T> {
	item: T
	isSelect?: boolean
	isMouseOver?: boolean
	readOnly?: boolean
	variant?: number
}

interface Props<T> {
	items: T[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	variant?: number
	readOnly?: boolean
	/** indice selezionato */
	select?: number
	onSelect?: (index: number, e:React.MouseEvent<HTMLElement>) => void
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
	const handleSelect = (index: number, e:React.MouseEvent<HTMLElement>) => {
		onSelect?.(index, e)
	}

	// RENDER
	if (!items) return null

	return <div style={{ ...cssContainer, ...style }}>

		{items.map((item, index) =>
			<ListRow
				key={index}
				onClick={(e) => handleSelect(index, e)}
				readOnly={readOnly}
				select={select==index}
				variant={variant}
			>
				<RenderRow
					item={item}
					readOnly={readOnly}
					isSelect={index == select}
					variant={variant}
				/>
			</ListRow>
		)}

	</div>
}

export default List

const cssContainer: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}
