import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/stores/docs/types"
import { dbLoad, dbSave } from "@/stores/docs/utils/db"
import { buildStore, getID } from "@/stores/docs/utils/factory"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useMemo } from "react"
import IconRow from "./rows/IconRow"


interface Props {
	style?: React.CSSProperties
}

const MainMenu: FunctionComponent<Props> = ({
	style,
}) => {

	// STORE
	const docSa = useStore(docSo)

	// HOOKS
	const stores = useMemo(() => docSo.getIconized(), [docSa.all])

	// HANDLERS
	const handleNodes = () => {
		const cnnStore = buildStore({
			type: DOC_TYPE.CONNECTIONS,
		})
		docSo.add({ view: cnnStore, anim: true })
	}
	const handleSave = async () => {
		const states = docSo.state.all.map(store => store.getSerialization())
		await dbSave(states)
	}
	const handleLoad = async () => {
		const states = await dbLoad()
		const stores = states.map(state => {
			const store = buildStore({ type: state.type })
			store.setSerialization(state)
			return store
		})
		docSo.setAll(stores)
	}
	const handleOpenStoreClick = (store: ViewStore) => {
		docSo.uniconize(store)
	}
	const handleCloseStoreClick = (store: ViewStore) => {
		docSo.remove({ view: store })
	}

	// RENDER
	return <div style={{ ...cssContainer, ...style }}>
		<IconRow onClick={handleNodes} title="CONNECTIONS" />
		{/* <button onClick={handleLoad}>LOAD</button>
		<button onClick={handleSave}>SAVE</button> */}
		{stores.map((store) => (
			<IconRow key={getID(store.state)}
				title={store.getTitle()}
				subtitle={store.getSubTitle()}
				onClick={() => handleOpenStoreClick(store)}
				onClose={() => handleCloseStoreClick(store)}
			/>
		))}
	</div>
}

export default MainMenu

const cssContainer: React.CSSProperties = {
	display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
	backgroundColor: "red",
	padding: "10px",
}