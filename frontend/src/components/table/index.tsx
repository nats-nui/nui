import layoutSo from "@/stores/layout"
import { CSSProperties, FunctionComponent, useMemo, useState } from "react"
import Header, { ORDER_TYPE } from "./Header"



export interface ItemProp {
	label?: string
	getValue?: (item: any) => any
	getShow?: (item: any) => string

	notOrderable?: boolean
}

interface Props {
	props: ItemProp[]
	propMain?: ItemProp
	items?: any[]
	selectId?: string
	variant?: number
	onSelectChange?: (item: any) => void
	getId?: (item: any) => string
	style?: React.CSSProperties
}

const Table: FunctionComponent<Props> = ({
	props,
	propMain,
	items = [],
	selectId,
	variant = 0,
	onSelectChange,
	getId = (item) => item.toString(),
	style,
}) => {

	// STORE
	const [propOrder, setPropOrder] = useState<ItemProp>(null)
	const [typeOrder, setTypeOrder] = useState<ORDER_TYPE>(ORDER_TYPE.ASC)

	// HOOKs
	const itemsSort: any[] = useMemo(() => {
		if (!propOrder || typeOrder == ORDER_TYPE.NOTHING) {
			return items.sort((i1, i2) => {
				const v1 = getValueString(i1, propMain)
				const v2 = getValueString(i2, propMain)
				return v1.localeCompare(v2)
			})
		}
		return items.sort((i1, i2) => {
			const v1 = propOrder.getValue(i1)
			const v2 = propOrder.getValue(i2)
			return typeOrder == ORDER_TYPE.ASC ? v1 - v2 : v2 - v1
		})
	}, [items, propOrder, typeOrder])

	// HANDLER
	const handleSelect = (item: any) => onSelectChange(item)
	const handleOrderChange = (prop: ItemProp, type: ORDER_TYPE) => {
		setPropOrder(prop)
		setTypeOrder(type)
	}

	// RENDER
	const isSelected = (item: any) => getId(item) == selectId
	function getValueString(item: any, prop: ItemProp): string {
		return prop.getShow?.(item) ?? prop.getValue?.(item)
	}

	return <table style={{ ...cssTable, ...style }}>

		<Header
			props={props}
			order={propOrder}
			orderType={typeOrder}
			onOrderChange={handleOrderChange}
		/>

		<tbody>
			{itemsSort.map((item, index) => {
				const id = getId(item)
				const selected = isSelected(item)
				return <>
					{!!propMain && (
						<tr
							key={`${id}_1`}
							style={cssRowMain(selected, variant)}
							onClick={() => handleSelect(item)}
						>
							<td colSpan={4} style={{ padding: "5px 2px" }}>
								{getValueString(item, propMain)}
							</td>
						</tr>
					)}

					<tr key={id}
						style={cssRow(selected, variant)}
						onClick={() => handleSelect(item)}
					>
						{props.map((prop) => (
							<td style={cssRowCellNumber}>
								{getValueString(item, prop)}
							</td>
						))}
					</tr>

				</>
			})}
		</tbody>
	</table>
}

export default Table



const cssTable: CSSProperties = {
	width: "100%",
	borderCollapse: "collapse",
	borderSpacing: 0,
}
const cssHead: CSSProperties = {
	fontSize: 13,
	fontWeight: 600,
	height: 28,
	position: 'sticky',
	top: '0',
	backgroundColor: '#3e3e3e',
	zIndex: 1,
}
const cssHeadCell: CSSProperties = {
	padding: "3px 2px",
	textAlign: "right",
}

const cssRowMain = (select: boolean, variant: number): CSSProperties => ({
	cursor: "pointer",
	fontSize: '12px',
	//fontWeight: '600',
	//backgroundColor: '#bfbfbf',
	//color: 'black',
	...select ? {
		opacity: 1,
		fontWeight: '600',
		backgroundColor: layoutSo.state.theme.palette.var[variant].bg2,
		color: layoutSo.state.theme.palette.var[variant].fg
	} : {
		opacity: 0.8,
	},
})

const cssRow = (select: boolean, variant: number): CSSProperties => ({
	cursor: "pointer",
	...select ? {
		backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
		color: layoutSo.state.theme.palette.var[variant].fg
	} : {
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
})

const cssRowCell: CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	borderRight: '1px solid rgb(255 255 255 / 15%)',
	padding: "3px 2px",
}
const cssRowCellNumber: CSSProperties = {
	...cssRowCell,
	fontFamily: "monospace",
	fontSize: 12,
	fontWeight: 600,
	textAlign: "right",
}
const cssRowCellString: CSSProperties = {
	...cssRowCell,
	overflow: "hidden",
	whiteSpace: "nowrap",
	textOverflow: "ellipsis",
	maxWidth: 0,
}