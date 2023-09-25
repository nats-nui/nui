import MessagesDoc from "@/components/stacks/messages/MessagesDoc"
import ServicesDoc from "@/components/stacks/services/ServicesDoc"
import { CnnViewStore } from "@/stores/stacks/connection"
import { ViewStore } from "@/stores/docs/viewBase"
import { MessagesStore } from "@/stores/stacks/messages"
import { ServicesStore } from "@/stores/stacks/services"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import ConnectionsDoc from "./stacks/connections/ConnectionsDoc"



interface DocCmpProps {
	view: ViewStore,
	style?: React.CSSProperties,
}
const DocCmp: FunctionComponent<DocCmpProps> = ({
	view,
	style,
}) => {
	const content = useMemo(() => {
		switch (view.state.type) {
			case DOC_TYPE.CONNECTIONS:
				return <ConnectionsDoc store={view as CnnViewStore} style={style}/>
			case DOC_TYPE.SERVICES:
				return <ServicesDoc store={view as ServicesStore} style={style}/>
			case DOC_TYPE.MESSAGES:
				return <MessagesDoc store={view as MessagesStore} style={style}/>
			default:
				return null
		}
	}, [view, style])
	return content
}

export default DocCmp