import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import OptionsCmp from "@/components/loaders/OptionsCmp"
import cnnSo from "@/stores/connections"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { CnnListStore } from "@/stores/stacks/connection"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CNN_STATUS, Connection, DOC_TYPE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useMemo } from "react"
import ElementRow from "../../rows/ElementRow"
import cls from "./ListView.module.css"
import connections from "@/mocks/data/connections"
import AlertDialog from "@/components/dialogs/AlertDialog"
import { MESSAGE_TYPE } from "@/stores/log/utils"



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
	useStore(cnnListSo.state.group)

	// HOOKs
	useEffect(() => {
		cnnSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (cnn: Connection) => cnnListSo.select(cnn.id)
	const handleNew = () => cnnListSo.create()
	const handleDelete = async () => {
		if (!await cnnListSo.alertOpen({
			title: "MESSAGE DELETE",
			body: "This action is irreversible.\nAre you sure you want to delete the CONNECTION?",
		})) return
		cnnListSo.select(null)
		await cnnSo.delete(selectId)
		cnnListSo.setSnackbar({ open: true,
			type: MESSAGE_TYPE.SUCCESS,
			title: "DELETED",
			body: "it is gone forever",
			timeout: 5000,
		})
	}

	// RENDER
	const connnections = useMemo(() => {
		return cnnSo.state.all?.sort((c1, c2) => c1.name?.localeCompare(c2.name))
	}, [cnnSa.all])
	if (!connnections) return null

	const getTitle = (cnn: Connection) => cnn.name
	const getSubtitle = (cnn: Connection) => cnn.hosts?.[0]
	const isNewSelect = cnnListSa.linked?.state.type == DOC_TYPE.CONNECTION && (cnnListSa.linked as CnnDetailStore).state.editState == EDIT_STATE.NEW
	const selectId = (cnnListSa.linked as CnnDetailStore)?.state?.connection?.id
	const isSelected = (cnn: Connection) => cnn.id == selectId

	return <FrameworkCard
		store={cnnListSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={cnnSo}
				storeView={cnnListSo}
			/>
			<div style={{ flex: 1 }} />
			{!!selectId && <Button
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
				icon={<div className={`${cls[cnn.status ?? CNN_STATUS.UNDEFINED]} ${cls.row}`} />}
				selected={isSelected(cnn)}
				onClick={() => handleSelect(cnn)}
			/>
		))}

		<AlertDialog store={cnnListSo} />

	</FrameworkCard>
}

export default CnnListView
