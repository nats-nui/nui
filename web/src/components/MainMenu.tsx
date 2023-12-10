import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/stores/docs/types"
import { buildStore } from "@/stores/docs/utils/factory"
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

	const handleDebugPingStop = () => {
		//ss.send({ type: "mock", cmm: "ping:stop", data: null })
	}
	const handleDebugPingStart = () => {
		//ss.send({ type: "mock", cmm: "ping:start", data: null })
	}

	// RENDER
	return <div style={{ ...cssContainer, ...style }}>
		<button onClick={handleNodes}>NODES</button>
		{/* <button onClick={handleDebugPingStop}>DEBUG: ping:stop</button>
		<button onClick={handleDebugPingStart}>DEBUG: ping:start</button> */}
	</div>
}

export default MainMenu

const cssContainer: React.CSSProperties = {
	display: "flex",
	flexDirection: "column"
}