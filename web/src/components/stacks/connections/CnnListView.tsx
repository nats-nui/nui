import imgCnn from "@/assets/cnn-hdr.svg"
import Header from "@/components/Heder"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { CnnListState, CnnListStore } from "@/stores/stacks/connection/list"
import { Connection } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"


interface Props {
	store?: CnnListStore
	style?: React.CSSProperties,
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const CnnListView: FunctionComponent<Props> = ({
	store: viewSo,
	style,
}) => {

	// STORE
	const viewSa = useStore(viewSo) as CnnListState
	const cnnSa = useStore(cnnSo) as ConnectionState

	// HOOKs

	// HANDLER
	const handleSelectConnection = (cnn: Connection) => viewSo.select(cnn)
	const handleNewConnection = () => viewSo.create()
	const handleDelConnection = () => cnnSo.delete(selectedId)

	// RENDER
	const connnections = cnnSa.all
	if (!connnections) return null
	const selectedId = viewSo.getSelectId()
	const isSelected = (cnn: Connection) => selectedId == cnn.id

	return <div style={{ ...cssContainer, ...style }}>

		<Header view={viewSo} title="CONNECTIONS" icon={<img src={imgCnn} />} />

		<div style={{ display: "flex" }}>
			<button
				onClick={handleNewConnection}
			>new</button>
			<button
				onClick={handleDelConnection}
			>del</button>
		</div>


		{connnections.map(cnn => (
			<div key={cnn.id} style={cssItem(isSelected(cnn))}
				onClick={_ => handleSelectConnection(cnn)}
			>{cnn.name}</div>
		))}

	</div>
}

export default CnnListView

const cssContainer: React.CSSProperties = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	width: "223px",
}

const cssItem = (select: boolean): React.CSSProperties => ({
	cursor: "pointer",
	backgroundColor: select ? "red" : "unset"
})