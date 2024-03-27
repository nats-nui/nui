import SortDownIcon from "@/icons/SortDownIcon"
import { CSSProperties, FunctionComponent, useState } from "react"
import { ItemProp } from "./VTable"
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

const VHeader: FunctionComponent<Props> = ({
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
			if (newOrder == ORDER_TYPE.NOTHING) newProp = null
		}
		onOrderChange(newProp, newOrder)
	}

	// RENDER

	return (
		<div style={cssHead}>
			{props.map((prop, index) => (
				<div style={{...cssHeadCell, flex: prop.flex ?? 1}} key={index}
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
							<div style={{ width: 18, height: 18 }} />
						)}
						<div>{prop.label}</div>
					</div>
				</div>
			))}
		</div>
	)
}

export default VHeader

const cssHead: CSSProperties = {
	display: "flex",
	fontSize: 10,
	fontWeight: 600,
	height: 28,
	position: 'sticky',
	top: 0,
	backgroundColor: "#5b5b5b",
	zIndex: 1,
	boxShadow: 'rgba(0, 0, 0, 0.5) 0px 2px 2px 0px',
}

const cssHeadCell: CSSProperties = {
	textAlign: "right",
	borderRight: '2px solid #3e3e3e',
	borderTop: '2px solid #3e3e3e',
	padding: "3px 5px",
}


