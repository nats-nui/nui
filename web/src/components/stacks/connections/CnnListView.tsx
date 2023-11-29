import imgCnn from "@/assets/cnn-hdr.svg"
import Header from "@/components/Heder"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { CnnListState, CnnListStore } from "@/stores/stacks/connection/list"
import { Connection } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import CnnRow from "./CnnRow"
import layoutSo from "@/stores/layout"
import ActionGroup from "../../buttons/ActionGroup"
import Button from "@/components/buttons/Button"



interface Props {
	store?: CnnListStore
	style?: React.CSSProperties,
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const CnnListView: FunctionComponent<Props> = ({
	store: cnnListSo,
	style,
}) => {

	// STORE
	useStore(cnnListSo) as CnnListState
	const cnnSa = useStore(cnnSo) as ConnectionState

	// HOOKs
	useEffect(() => {
		cnnSo.fetch()
	}, [])

	// HANDLER
	const handleSelectConnection = (cnn: Connection) => cnnListSo.select(cnn)
	const handleNewConnection = () => cnnListSo.create()
	const handleDelConnection = () => cnnSo.delete(selectedId)

	// RENDER
	const connnections = cnnSa.all
	if (!connnections) return null
	const selectedId = cnnListSo.getSelectId()
	const isSelected = (cnn: Connection) => selectedId == cnn.id

	return <div style={{ ...cssContainer, ...style }}>

		<Header view={cnnListSo} title="CONNECTIONS" icon={<img src={imgCnn} />} />

		<ActionGroup>
			<Button onClick={handleNewConnection} label="NEW" />
			<Button onClick={handleDelConnection} label="DELETE" />
		</ActionGroup>

		{connnections.map(cnn => (
			<CnnRow key={cnn.id}
				cnn={cnn}
				selected={isSelected(cnn)}
				onClick={handleSelectConnection}
			/>
		))}

	</div>
}

export default CnnListView

const cssContainer: React.CSSProperties = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	//width: "250px",
}
