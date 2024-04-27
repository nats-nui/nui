import React, { CSSProperties, FunctionComponent, useMemo, useState } from "react"
import Header, { ORDER_TYPE } from "./Header"
import cls from "./Table.module.css"
import CopyButton from "../buttons/CopyButton"



export interface ItemProp {
	label?: string
	getValue?: (item: any) => any
	getShow?: (item: any) => string

	isMain?: boolean
}

interface Props {
	/** le prop da visualizzare nelle colonne */
	props: ItemProp[]
	/** i dati */
	items?: any[]
	/** l'id selezionato */
	selectId?: string
	/** stessa riga per propMain e props */
	singleRow?: boolean
	/** evento cambio selezione */
	onSelectChange?: (item: any) => void
	/** callback per determinare un id di un item */
	getId?: (item: any) => string
	style?: React.CSSProperties
}

const Table: FunctionComponent<Props> = ({
	props,
	items = [],
	selectId,
	singleRow,
	onSelectChange,
	getId = (item) => item.toString(),
	style,
}) => {

	// STORE
	const [propOrder, setPropOrder] = useState<ItemProp>(null)
	const [typeOrder, setTypeOrder] = useState<ORDER_TYPE>(ORDER_TYPE.ASC)

	// HOOKs
	const propMain = useMemo(() => props.find(p => p.isMain), [props])
	const propToShow = useMemo(() => singleRow ? props : props.filter(p => !p.isMain), [props, singleRow])
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

	return <table className={cls.root} style={style}>

		<Header
			props={propToShow}
			order={propOrder}
			orderType={typeOrder}
			onOrderChange={handleOrderChange}
		/>

		<tbody>
			{itemsSort.map((item, index) => {
				const id = getId(item)
				const selected = isSelected(item)
				const mainText = getValueString(item, propMain)

				const clsSelected = selected ? `color-bg color-text ${cls.selected}` : ""
				const clsRow = `${cls.row} ${clsSelected} hover-container`
				const clsCell = `${cls.cell}`
				const clsCellMain = `${clsCell} ${cls.main}`

				return <React.Fragment key={id}>

					{!!propMain && !singleRow && (
						<tr
							className={clsRow}
							onClick={() => handleSelect(item)}
						>
							<td colSpan={colspan}
								className={clsCellMain}
							>
								{mainText}
							</td>
							<CopyButton absolute value={mainText} />
						</tr>
					)}

					<tr
						className={clsRow}
						onClick={() => handleSelect(item)}
					>
						{propToShow.map((prop, index) => !(!singleRow && prop.isMain) && (
							<td key={index}
								className={prop.isMain ? clsCellMain : clsCell}
							>
								{getValueString(item, prop)}
							</td>
						))}
					</tr>

				</React.Fragment>
			})}
		</tbody>
	</table>
}

export default Table

