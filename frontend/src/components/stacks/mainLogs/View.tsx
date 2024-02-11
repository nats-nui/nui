import FrameworkCard from "@/components/FrameworkCard"
import { LogsStore } from "@/stores/stacks/mainLogs"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"


interface Props {
	store?: LogsStore
	style?: React.CSSProperties,
}

const LogsView: FunctionComponent<Props> = ({
	store: lgsSo,
	style,
}) => {

	// STORE
	const lgsSa = useStore(lgsSo)

	// HOOKs

	// HANDLER

	// RENDER

	return <FrameworkCard
		store={lgsSo}
	>

		CIAO

	</FrameworkCard>
}

export default LogsView

