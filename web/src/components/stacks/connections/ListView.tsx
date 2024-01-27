import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { CnnListState, CnnListStore } from "@/stores/stacks/connection/list"
import { CNN_STATUS, Connection } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import ElementRow from "../../rows/ElementRow"
import IconRow from "../../rows/IconRow"
import layoutSo, { COLOR_VAR } from "@/stores/layout"



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
	const cnnListSa = useStore(cnnListSo) 
	const cnnSa = useStore(cnnSo)

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
	const getTitle = (cnn: Connection) => cnn.name
	const getSubtitle = (cnn: Connection) => cnn.hosts?.[0]
	const variant = cnnListSa.colorVar

	return <FrameworkCard
		store={cnnListSo}
		actionsRender={<>
			<Button
				label="NEW"
				variant={variant}
				onClick={handleNew}
			/>
			<Button
				label="DELETE"
				variant={variant}
				onClick={handleDel}
			/>
		</>}
		iconizedRender={<div style={cssIconized}>{
			connnections.map(cnn => (
				<IconRow key={cnn.id}
					title={getTitle(cnn)}
					subtitle={getSubtitle(cnn)}
					selected={isSelected(cnn)}
					variant={variant}
					onClick={() => handleSelect(cnn)}
				/>
			))
		}</div>}
	>
		{connnections.map(cnn => (
			<ElementRow key={cnn.id}
				title={getTitle(cnn)}
				subtitle={getSubtitle(cnn)}
				icon={<div style={cssLed(cnn.status ?? CNN_STATUS.UNDEFINED)} />}
				selected={isSelected(cnn)}
				variant={variant}
				onClick={() => handleSelect(cnn)}
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

const cssLed = (status: CNN_STATUS): React.CSSProperties => ({
	width: 14, height: 14,
	border: "2px solid black",
	borderRadius: "50%",
	backgroundColor: {
		[CNN_STATUS.UNDEFINED]: "grey",
		[CNN_STATUS.CONNECTED]: "#51FD15",
		[CNN_STATUS.RECONNECTING]: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,
		[CNN_STATUS.DISCONNECTED]: layoutSo.state.theme.palette.var[COLOR_VAR.FUCHSIA].bg,
	}[status]
	//border: "2px solid black",
})