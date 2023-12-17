import Header from "@/components/Header"
import Button from "@/components/buttons/Button"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CnnListState, CnnListStore } from "@/stores/stacks/connection/list"
import { Connection } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import ActionGroup from "../../buttons/ActionGroup"
import CnnRow from "./CnnRow"



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
	const cnnListSa = useStore(cnnListSo) as CnnListState
	const cnnSa = useStore(cnnSo) as ConnectionState

	// HOOKs
	useEffect(() => {
		cnnSo.fetch()
	}, [])

	// HANDLER
	const handleSelectConnection = (cnn: Connection) => cnnListSo.select(cnn)
	const handleNewConnection = () => {
		cnnListSo.create()
		
	}
	const handleDelConnection = () => {
		cnnSo.delete(selectedId)
		cnnListSo.select(null)
	}

	// RENDER
	const connnections = cnnSa.all
	if (!connnections) return null
	const selectedId = cnnListSo.getSelectId()
	const isSelected = (cnn: Connection) => selectedId == cnn.id
	const bttNewSelect = !!cnnListSa.linked && (cnnListSa.linked as CnnDetailStore).getConnection()?.id == null

	return <div style={{ ...cssContainer, ...style }}>

		<Header view={cnnListSo} />

		<ActionGroup>
			<Button
				label="NEW"
				select={bttNewSelect}
				onClick={handleNewConnection}
			/>
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
