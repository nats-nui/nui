import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CnnListState, CnnListStore } from "@/stores/stacks/connection/list"
import { Connection } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import CnnRow from "../../rows/CnnRow"
import CnnCompactRow from "../../rows/CnnCompactRow"
import tooltipSo from "@/stores/tooltip"
import TooltipWrapCmp from "@/components/TooltipWrapCmp"


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
	const handleSelect = (cnn: Connection) => cnnListSo.select(cnn)
	const handleNew = () => cnnListSo.create()
	const handleDel = () => {
		cnnSo.delete(selectedId)
		cnnListSo.select(null)
	}

	// RENDER
	const connnections = cnnSa.all
	if (!connnections) return null
	const selectedId = cnnListSa.selectId
	const isSelected = (cnn: Connection) => selectedId == cnn.id
	const getTitle = (cnn:Connection) => cnn.name
	const getSubtitle = (cnn:Connection) => cnn.hosts?.[0]
	const variant = cnnListSo.getColorVar()

	return <FrameworkCard
		store={cnnListSo}
		actionsRender={<>
			<TooltipWrapCmp
				content={<div style={{ maxWidth: 150 }}>
					Che vuoi che faccia? ... crea una nuova connessione no?
				</div>}
				variant={variant}
			>
				<Button
					label="NEW"
					variant={variant}
					onClick={handleNew}
				/>
			</TooltipWrapCmp>
			<Button
				label="DELETE"
				variant={variant}
				onClick={handleDel}
			/>
		</>}
		iconizedRender={<div style={cssIconized}>{
			connnections.map(cnn => (
				<CnnCompactRow key={cnn.id}
				title={getTitle(cnn)}
				subtitle={getSubtitle(cnn)}
				selected={isSelected(cnn)}
				variant={variant}
				onClick={()=>handleSelect(cnn)}
				/>
			))
		}</div>}
	>
		{connnections.map(cnn => (
			<CnnRow key={cnn.id}
				title={getTitle(cnn)}
				subtitle={getSubtitle(cnn)}
				selected={isSelected(cnn)}
				variant={variant}
				onClick={()=>handleSelect(cnn)}
			/>
		))}
	</FrameworkCard>
}

export default CnnListView

const cssIconized: React.CSSProperties = {
	marginTop: 25,
	display: "flex",
	flexDirection: "column",
	gap: 10,
}