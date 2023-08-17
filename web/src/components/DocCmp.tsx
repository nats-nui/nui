import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import ConnectionsDoc from "./connections/ConnectionsDoc"
import ServicesDoc from "./services/ServicesDoc"
import MessagesDoc from "./messages/MessagesDoc"
import { ViewStore } from "@/stores/docs/doc"
import { ConnectionStore } from "@/stores/connection"
import { ServicesStore } from "@/stores/services"
import { MessagesStore } from "@/stores/messages"



interface DocCmpProps {
	view: ViewStore
}
const DocCmp: FunctionComponent<DocCmpProps> = ({
	view,
}) => {
	const content = useMemo(() => {
		switch (view.state.type) {
			case DOC_TYPE.CONNECTIONS:
				return <ConnectionsDoc store={view as ConnectionStore} />
			case DOC_TYPE.SERVICES:
				return <ServicesDoc store={view as ServicesStore} />
			case DOC_TYPE.MESSAGES:
				return <MessagesDoc store={view as MessagesStore} />
			default:
				return null
		}
	}, [view])
	return content
}

export default DocCmp