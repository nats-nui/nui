import docSo from "@/stores/docs"
import { buildStore } from "@/stores/docs/utils/factory"
import { DOC_TYPE } from "@/stores/docs/types"
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
		docSo.add({ view: cnnStore })
	}

	// RENDER
	return <div style={{ ...cssContainer, ...style }}>
		<button onClick={handleNodes}>NODES</button>
		<button>TOPIC</button>
		<button>TEST</button>
		<button>CREDIT</button>
	</div>
}

export default MainMenu

const cssContainer: React.CSSProperties = {
	display: "flex",
	flexDirection: "column"
}