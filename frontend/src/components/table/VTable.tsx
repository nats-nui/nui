import React, { CSSProperties, FunctionComponent, useMemo, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import CopyButton from "../buttons/CopyButton"
import { ORDER_TYPE } from "./Header"
import cls from "./Table.module.css"
import VHeader from "./VHeader"



export interface ItemProp {
	label?: string
	flex?: number,
	getValue?: (item: any) => any
	getShow?: (item: any) => string

	notOrderable?: boolean
}

interface Props {
	props: ItemProp[]
	propMain?: ItemProp
	items?: any[]
	selectId?: string
	onSelectChange?: (item: any) => void
	getId?: (item: any) => string
	style?: React.CSSProperties
}

const VTable: FunctionComponent<Props> = ({
	props,
	propMain,
	items = [],
	selectId,
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
	const colspan = props.length
	function getValueString(item: any, prop: ItemProp): string {
		if (!prop) return
		return prop.getShow?.(item) ?? prop.getValue?.(item)
	}


	return <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
		<VHeader
			props={props}
			order={propOrder}
			orderType={typeOrder}
			onOrderChange={handleOrderChange}
		/>
		<Virtuoso
			className={cls.root}
			style={{ ...style, width: "100%" }}
			data={itemsSort}
			totalCount={itemsSort.length}
			itemContent={(index, item) => {

				//const id = getId(item)
				const selected = isSelected(item)
				const mainText = getValueString(item, propMain)

				return <div style={{ display: "flex", flexDirection: "column" }}>
					{!!propMain && (
						<div
							style={cssRowMain(selected)} className={`hover-container ${selected ? "color-bg-l1 color-text" : ""}`}
							onClick={() => handleSelect(item)}
						>
							<td colSpan={colspan} style={{ padding: "5px 2px", overflowWrap: 'anywhere' }}>
								{mainText}
							</td>
							<CopyButton absolute value={mainText} />
						</div>
					)}

					<div
						style={cssRow(selected)} className={selected ? "color-bg color-text" : null}
						onClick={() => handleSelect(item)}
					>
						{props.map((prop, index) => (
							<div key={index} style={{...cssRowCellNumber, flex: prop.flex ?? 1}}>
								{getValueString(item, prop)}
							</div>
						))}
					</div>
				</div>
			}}
		/>

	</div>
	/*
		return <table className={cls.root} style={style}>
	
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
					const mainText = getValueString(item, propMain)
	
					return <React.Fragment key={id}>
	
						{!!propMain && (
							<tr
								style={cssRowMain(selected)} className={`hover-container ${selected ? "color-bg-l1 color-text" : ""}`}
								onClick={() => handleSelect(item)}
							>
								<td colSpan={colspan} style={{ padding: "5px 2px", overflowWrap: 'anywhere' }}>
									{mainText}
								</td>
								<CopyButton absolute value={mainText} />
							</tr>
						)}
	
						<tr
							style={cssRow(selected)} className={selected ? "color-bg color-text" : null}
							onClick={() => handleSelect(item)}
						>
							{props.map((prop, index) => (
								<td key={index} style={cssRowCellNumber}>
									{getValueString(item, prop)}
								</td>
							))}
						</tr>
	
					</React.Fragment>
				})}
			</tbody>
		</table>
		*/
}

export default VTable



const cssTable: CSSProperties = {

}

const cssRowMain = (select: boolean): CSSProperties => ({

	position: "relative",
	cursor: "pointer",
	fontSize: '12px',
	...select ? {
		opacity: 1,
		fontWeight: '600',
	} : {
		opacity: 0.8,
	},
})

const cssRow = (select: boolean): CSSProperties => ({
	display: "flex",
	cursor: "pointer",
	backgroundColor: !select ? "rgba(0, 0, 0, 0.5)" : null,
})

const cssRowCell: CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	borderRight: '2px solid rgba(255,255,255,.2)',
	padding: "3px 5px",
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