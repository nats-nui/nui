import docSo from "@/stores/docs"
import { buildStore } from "@/stores/docs/utils/factory"
import { DOC_TYPE } from "@/stores/docs/types"
import React, { FunctionComponent } from "react"
import ss from "@/plugins/SocketService"

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
		docSo.add({ view: cnnStore })
	}
	const handleDebugMessage = () => {
		
	}

	// RENDER
	return <div style={{ ...cssContainer, ...style }}>
		<button onClick={handleNodes}>NODES</button>
		<button onClick={handleDebugMessage}>DEBUG: message</button>
	</div>
}

export default MainMenu

const cssContainer: React.CSSProperties = {
	display: "flex",
	flexDirection: "column"
}