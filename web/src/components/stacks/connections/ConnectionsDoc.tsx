import Header from "@/components/Heder"
import { CnnViewState, CnnViewStore } from "@/stores/stacks/connection"
import { Connection, POSITION_TYPE } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import cnnSo, { ConnectionState } from "@/stores/connections"
import imgCnn from "@/assets/cnn-hdr.svg"


interface Props {
	store?: CnnViewStore
	style?: React.CSSProperties,
}

const ConnectionsDoc: FunctionComponent<Props> = ({
	store: viewSo,
	style,
}) => {

	// STORE
	const viewSa = useStore(viewSo) as CnnViewState
	const cnnSa = useStore(cnnSo) as ConnectionState

	// HOOKs

	// HANDLER
	const handleSelectConnection = (cnn: Connection) => {
		viewSo.select(cnn)
	}

	// RENDER
	const connnections = cnnSa.all
	if (!connnections) return null
	const isStacked = viewSa.position == POSITION_TYPE.STACKED
	const selected = viewSo.getSelectId()
	const isSelected = (index: number) => selected == index

	return (
		<div style={{...cssContainer, ...style}}>

			<Header view={viewSo} title="CONNECTIONS" icon={<img src={imgCnn} />}/>

			<button>new</button>
			{!isStacked && connnections.map((cnn, index) => (
				<div key={cnn.id} style={cssItem(isSelected(index))}
					onClick={_ => handleSelectConnection(cnn)}
				>{cnn.name}</div>
			))}
			{/* <DetailCmp store={cnnSo}/> */}
		</div>
	)
}

export default ConnectionsDoc

const cssContainer: React.CSSProperties = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	width: "223px",
}

const cssItem = (select: boolean): React.CSSProperties => ({
	backgroundColor: select ? "gray" : "unset"
})