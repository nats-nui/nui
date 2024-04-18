import React, { FunctionComponent } from "react"
import ListRow from "./ListRow"



export interface RenderRowBaseProps<T> {
	item: T
	isSelect?: boolean
}

interface Props<T> {
	items: T[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	RenderRow2?: (item: T, index: number) => React.ReactNode
	readOnly?: boolean
	height?: number
	/** indice selezionato */
	select?: number
	onSelect?: (index: number, e: React.MouseEvent<HTMLElement>) => void
	style?: React.CSSProperties
	className?: string
}

/** lista generica non editabile */
function List<T>({
	items,
	RenderRow = ({ item }) => <div className="list-row">{item?.toString() ?? ""}</div>,
	RenderRow2,
	readOnly,
	height,
	select,
	onSelect,
	style = {},
	className,
}: Props<T>) {

	// STORES

	// HOOKS

	// HANDLERS
	const handleSelect = (index: number, e: React.MouseEvent<HTMLElement>) => {
		onSelect?.(index, e)
	}

	// RENDER
	if (!items || items.length == 0) return <div className="lbl-empty lbl-disabled">EMPTY LIST</div>
	const isSelect = (index: number) => typeof select == "number" && select == index

	return <div
		className={className}
		style={{ ...cssContainer(height), ...style }}
	>
		{items.map((item, index) => {

			if (RenderRow2) {
				const row = RenderRow2(item, index)
				if ( !row ) return null
				return <ListRow key={index}
					onClick={(e) => handleSelect(index, e)}
					readOnly={readOnly}
					isSelect={isSelect(index)}
				>{row}</ListRow>
			}

			// [II] DA ELIMINARE
			return <ListRow key={index}
				onClick={(e) => handleSelect(index, e)}
				readOnly={readOnly}
				isSelect={isSelect(index)}
			>
				<RenderRow item={item} isSelect={isSelect(index)} />
			</ListRow>

		}
		)}
	</div>
}

export default List

const cssContainer = (height: number): React.CSSProperties => ({
	...height && {
		height: height,
		overflowY: "auto",
	},
})

export const ListMemo = React.memo(
	List,
	(prev, curr) => prev.items == curr.items && prev.readOnly == curr.readOnly && prev.select == curr.select && prev.RenderRow2 == curr.RenderRow2
)

