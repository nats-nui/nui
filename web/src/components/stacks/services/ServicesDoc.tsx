import { ServicesState, ServicesStore } from "@/stores/services"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Header from "@/components/Heder"
import SubscriptionsDialog from "../connections/SubscriptionsDialog"
import { ConnectionStore } from "@/stores/connection"
import DetailCmp from "../connections/DetailCmp"



interface Props {
	store?: ServicesStore
}

const ServicesDoc: FunctionComponent<Props> = ({
	store: serviceSo,
}) => {

	// STORE
	const serviceSa = useStore(serviceSo) as ServicesState
	//const cnnSa = useStore(cnnSo) as ConnectionStore

	// HOOKs

	// HANDLER
	const handleClickMessages = () => {
		serviceSo.openMessages()
	}

	// RENDER
	return (
		<div style={cssContainer}>
			<Header view={serviceSo} />
			<div style={cssItem}
				onClick={handleClickMessages}
			>MESSAGES</div>
			<div style={cssItem}>DATABASES</div>
			<div style={cssItem}>SETTINGS</div>
			<DetailCmp 
				store={serviceSa.parent as ConnectionStore} 
				parentSo={serviceSo}
			/>
		</div>
	)
}

export default ServicesDoc

const cssContainer: React.CSSProperties = {
	paddingLeft: "15px",
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: "#BBFB35",
	width: "146px",
}

const cssItem: React.CSSProperties = {
	color: "red"
}
