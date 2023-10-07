import MessagesView from "@/components/stacks/messages/MessagesView"
import CnnDetailView from "@/components/stacks/connections/CnnDetailView"
import { ViewStore } from "@/stores/docs/viewBase"
import { CnnListStore } from "@/stores/stacks/connection/list"
import { MessagesStore } from "@/stores/stacks/messages"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import CnnListView from "./stacks/connections/CnnListView"



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
				return <CnnListView store={view as CnnListStore} style={style}/>
			case DOC_TYPE.SERVICES:
				return <CnnDetailView store={view as CnnDetailStore} style={style}/>
			case DOC_TYPE.MESSAGES:
				return <MessagesView store={view as MessagesStore} style={style}/>
			default:
				return null
		}
	}, [view, style])
	return content
}

export default DocCmp