import Header from "@/components/Heder"
import connSo, { ConnectionState } from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Connection } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useMemo } from "react"
import CnnDetailCmp from "./CnnDetailCmp"



interface Props {
	store?: CnnDetailStore
	style?: React.CSSProperties,
}

const CnnDetailView: FunctionComponent<Props> = ({
	store: serviceSo,
	style,
}) => {

	// STORE
	const serviceSa = useStore(serviceSo) as CnnDetailState
	const connSa = useStore(connSo) as ConnectionState

	// HOOKs

	// HANDLER
	const handleClickMessages = () => {
		serviceSo.openMessages()
	}
	const handleChangeConnection = (connection: Connection) => {
		connSo.updateConnection(connection)
	}

	// RENDER
	const connection = useMemo(
		() => connSo.getById(serviceSa.connectionId), 
		[serviceSa.connectionId, connSa.all]
	)

	return (
		<div style={{ ...cssContainer, ...style }}>
			<Header view={serviceSo} title="SERVICES" />
			<div style={cssItem}
				onClick={handleClickMessages}
			>MESSAGES</div>
			<div style={cssItem}>DATABASES</div>
			<div style={cssItem}>SETTINGS</div>
			<hr />
			<CnnDetailCmp
				connection={connection}
				onChangeConnection={handleChangeConnection}
			/>
		</div>
	)
}

export default CnnDetailView

const cssContainer: React.CSSProperties = {
	paddingLeft: "15px",
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: "#BBFB35",
	color: "black",
	width: "146px",
}

const cssItem: React.CSSProperties = {
}
