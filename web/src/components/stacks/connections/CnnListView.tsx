import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CnnListState, CnnListStore } from "@/stores/stacks/connection/list"
import { Connection } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
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
	const variant = cnnListSo.getColorVar()

	return <FrameworkCard
		store={cnnListSo}
		actionsRender={<>
			<Button
				label="NEW"
				select={bttNewSelect}
				variant={variant}
				onClick={handleNewConnection}
			/>
			<Button 
				label="DELETE"
				variant={variant}
				onClick={handleDelConnection}  
			/>
		</>}
	>
		{connnections.map(cnn => (
			<CnnRow key={cnn.id}
				cnn={cnn}
				selected={isSelected(cnn)}
				variant={variant}
				onClick={handleSelectConnection}
			/>
		))}
	</FrameworkCard>
}

export default CnnListView
