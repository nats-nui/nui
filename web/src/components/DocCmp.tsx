import MessagesDoc from "@/components/stacks/messages/MessagesDoc"
import ServicesDoc from "@/components/stacks/services/ServicesDoc"
import { ConnectionStore } from "@/stores/connection"
import { ViewStore } from "@/stores/docs/docBase"
import { MessagesStore } from "@/stores/messages"
import { ServicesStore } from "@/stores/services"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import ConnectionsDoc from "./stacks/connections/ConnectionsDoc"



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