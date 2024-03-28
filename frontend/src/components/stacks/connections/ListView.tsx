import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import OptionsCmp from "@/components/options/OptionsCmp"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { CnnListStore } from "@/stores/stacks/connection"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CNN_STATUS, Connection, DOC_TYPE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import ElementRow from "../../rows/ElementRow"



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
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		cnnSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (cnn: Connection) => cnnListSo.select(cnn.id)
	const handleNew = () => cnnListSo.create()
	const handleDelete = () => {
		cnnSo.delete(selected)
		cnnListSo.select(null)
	}

	// RENDER
	const connnections = cnnSa.all
	if (!connnections) return null
	const selected = cnnListSa.select
	const isSelected = (cnn: Connection) => cnn.id == cnnListSa.select
	const getTitle = (cnn: Connection) => cnn.name
	const getSubtitle = (cnn: Connection) => cnn.hosts?.[0]
	const isNewSelect = cnnListSa.linked?.state.type == DOC_TYPE.CONNECTION && (cnnListSa.linked as CnnDetailStore).state.editState == EDIT_STATE.NEW

	return <FrameworkCard
		store={cnnListSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={cnnSo}
				storeView={cnnListSo}
			/>
			<div style={{ flex: 1 }} />
			{!!selected && <Button
				children="DELETE"
				onClick={handleDelete}
			/>}
			<Button
				children="NEW"
				select={isNewSelect}
				onClick={handleNew}
			/>
		</>}
	>
		{connnections.map(cnn => (
			<ElementRow key={cnn.id}
				title={getTitle(cnn)}
				subtitle={getSubtitle(cnn)}
				icon={<div style={cssLed(cnn.status ?? CNN_STATUS.UNDEFINED)} />}
				selected={isSelected(cnn)}
				onClick={() => handleSelect(cnn)}
			/>
		))}
	</FrameworkCard>
}

export default CnnListView

const cssLed = (status: CNN_STATUS): React.CSSProperties => ({
	width: 10, height: 10,
	//border: "2px solid black",
	borderRadius: "50%",
	backgroundColor: {
		[CNN_STATUS.UNDEFINED]: "grey",
		[CNN_STATUS.CONNECTED]: "#37d300",
		[CNN_STATUS.RECONNECTING]: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,
		[CNN_STATUS.DISCONNECTED]: layoutSo.state.theme.palette.var[COLOR_VAR.FUCHSIA].bg,
	}[status],
})