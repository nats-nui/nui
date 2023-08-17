import { ServicesState, ServicesStore } from "@/stores/services"
import { Service } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Header from "../Heder"


interface Props {
	store?: ServicesStore
}

const ServicesDoc: FunctionComponent<Props> = ({
	store:serviceSo,
}) => {

	// STORE
	const serviceSa = useStore(serviceSo) as ServicesState
	//const cnnSa = useStore(cnnSo) as ConnectionStore

	// HOOKs

	// HANDLER
	const handleClick = (service: Service) => {
		serviceSo.select(service)
	}

	// RENDER
	const services = serviceSo.getServices()
	if (!services) return null
	return (
		<div style={cssContainer}>
			<Header view={serviceSo} />
			{services.map((service, index) => (
				<div key={index} style={cssItem}
					onClick={_ => handleClick(service)}
				>{service.name}</div>
			))}
		</div>
	)
}

export default ServicesDoc

const cssContainer: React.CSSProperties = {
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: "#BBFB35",
	width: "146px",
}

const cssItem: React.CSSProperties = {
	color: "red"
}
