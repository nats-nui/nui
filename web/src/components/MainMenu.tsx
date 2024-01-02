import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/stores/docs/types"
import { dbLoad, dbSave } from "@/stores/docs/utils/db"
import { buildStore } from "@/stores/docs/utils/factory"
import { ViewStore } from "@/stores/stacks/viewBase"
import React, { FunctionComponent } from "react"


interface Props {
	style?: React.CSSProperties
}

const MainMenu: FunctionComponent<Props> = ({
	style,
}) => {

	// HANDLERS
	const handleNodes = () => {
		const cnnStore = buildStore({
			type: DOC_TYPE.CONNECTIONS,
		})
		docSo.add({ view: cnnStore, anim: true })
	}
	const handleSave = async () => {
		const states = docSo.state.all.map ( store => store.getSerialization() )
		await dbSave(states)
	}
	const handleLoad = async () => {
		const states = await dbLoad()
		const stores = states.map ( state => {
			const store = buildStore({ type: state.type })
			store.setSerialization(state)
			return store
		})
		docSo.setAll(stores)
	}

	// RENDER
	return <div style={{ ...cssContainer, ...style }}>
		<button onClick={handleNodes}>NODES</button>
		<button onClick={handleLoad}>LOAD</button>
		<button onClick={handleSave}>SAVE</button>

	</div>
}

export default MainMenu

const cssContainer: React.CSSProperties = {
	display: "flex",
	flexDirection: "column"
}