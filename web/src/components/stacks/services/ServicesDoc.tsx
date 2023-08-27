import Header from "@/components/Heder"
import { CnnViewStore } from "@/stores/stacks/connection"
import { ServicesState, ServicesStore } from "@/stores/stacks/services"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import DetailCmp from "../connections/DetailCmp"



interface Props {
	store?: ServicesStore
	style?: React.CSSProperties,
}

const ServicesDoc: FunctionComponent<Props> = ({
	store: serviceSo,
	style,
}) => {

	// STORE
	const serviceSa = useStore(serviceSo) as ServicesState

	// HOOKs

	// HANDLER
	const handleClickMessages = () => {
		serviceSo.openMessages()
	}

	// RENDER
	return (
		<div style={{...cssContainer, ...style}}>
			<Header view={serviceSo} title="SERVICES"/>
			<div style={cssItem}
				onClick={handleClickMessages}
			>MESSAGES</div>
			<div style={cssItem}>DATABASES</div>
			<div style={cssItem}>SETTINGS</div>
			<hr />
			<DetailCmp 
				store={serviceSa.parent as CnnViewStore} 
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
	color: "black",
	width: "146px",
}

const cssItem: React.CSSProperties = {
}
