import { Connection, POSITION_TYPE } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import Header from "../Heder"
//import docsSo from "@/stores/docs"
import { ConnectionState, ConnectionStore } from "@/stores/connection"


interface Props {
	store?: ConnectionStore
}

const ConnectionsDoc: FunctionComponent<Props> = ({
	store:cnnSo,
}) => {

	// STORE
	const cnnSa = useStore(cnnSo) as ConnectionState

	// HOOKs
	useEffect(() => {
		cnnSo.fetch()
	}, [])

	// HANDLER
	const handleClick = (cnn: Connection) => {
		cnnSo.select(cnn)
	}

	// RENDER
	const connnections = cnnSa.all
	if (!connnections) return null
	const isStacked = cnnSa.position == POSITION_TYPE.STACKED
	const selected = cnnSo.getSelectIndex()
	const isSelected = (index:number) => selected == index

	return (
		<div style={cssContainer}>
			<Header view={cnnSo} />
			{!isStacked && connnections.map((cnn, index) => (
				<div key={cnn.id} style={cssItem(isSelected(index))}
					onClick={_ => handleClick(cnn)}
				>{cnn.name}</div>
			))}
		</div>
	)
}

export default ConnectionsDoc

const cssContainer: React.CSSProperties = {
	flex: 1,
	display: "flex", 
	flexDirection: "column",
	backgroundColor: "#3E3E3E",
	width: "223px",
	
}

const cssItem = (select:boolean):React.CSSProperties => ({
	color: "black",
	backgroundColor: select ? "red" : "unset"
})