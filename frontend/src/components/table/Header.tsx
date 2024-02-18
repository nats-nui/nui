import SortDownIcon from "@/icons/SortDownIcon"
import { CSSProperties, FunctionComponent, useState } from "react"
import { ItemProp } from "."
import IconButton from "../buttons/IconButton"
import SortUpIcon from "@/icons/SortUpIcon"

export enum ORDER_TYPE {
	NOTHING,
	ASC,
	DESC,
}

interface Props {
	props: ItemProp[]
	order?: ItemProp
	orderType?: ORDER_TYPE
	onOrderChange?: (prop: ItemProp, type: ORDER_TYPE) => void
}

const Header: FunctionComponent<Props> = ({
	props,
	order,
	orderType,
	onOrderChange,
}) => {

	// STORE

	// HOOKs
	const [overProp, setOverProp] = useState<ItemProp>(null)

	// HANDLER
	const handleOrder = (prop: ItemProp) => {
		let newOrder = ORDER_TYPE.ASC
		let newProp = prop
		if (prop == order) {
			newOrder = orderType == ORDER_TYPE.ASC ? ORDER_TYPE.DESC : orderType == ORDER_TYPE.DESC ? ORDER_TYPE.NOTHING : ORDER_TYPE.ASC
			if ( newOrder == ORDER_TYPE.NOTHING ) newProp = null
		}
		onOrderChange(newProp, newOrder)
	}

	// RENDER

	return (
		<thead >
			<tr style={cssHead}>
				{props.map(prop => (
					<th style={cssHeadCell}
						onMouseLeave={() => setOverProp(null)}
					>
						<div style={{ display: "flex", alignItems: "center", justifyContent: 'flex-end' }}
							onMouseEnter={() => setOverProp(prop)}
						>
							{prop == overProp || prop == order ? (
								<IconButton style={{ opacity: prop == order ? 1 : .5 }}
									onClick={() => handleOrder(prop)}
								>
									{prop != order || orderType == ORDER_TYPE.ASC ? (
										<SortDownIcon />
									) : orderType == ORDER_TYPE.DESC ? (
										<SortUpIcon />
									) : (
										<div style={{ width: 14, height: 14 }} />
									)}
								</IconButton>
							) : (
								<div style={{ width: 24, height: 24 }} />
							)}
							<div>{prop.label}</div>
						</div>
					</th>
				))}
			</tr>
		</thead>
	)
}

export default Header



const cssHead: CSSProperties = {
	fontSize: 10,
	fontWeight: 600,
	height: 28,
	position: 'sticky',
	top: '0',
	backgroundColor: '#3e3e3e',
	zIndex: 1,
}
const cssHeadCell: CSSProperties = {
	//padding: "5px",
	padding: "3px 2px",
	textAlign: "right",
}


