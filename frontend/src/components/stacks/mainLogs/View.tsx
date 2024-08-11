import FrameworkCard from "@/components/cards/FrameworkCard"
import logSo from "@/stores/log"
import { Log } from "@/stores/log/utils"
import { ViewLogStore } from "@/stores/stacks/log"
import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useRef } from "react"
import { Virtuoso } from "react-virtuoso"
import LogIcon from "../../../icons/LogIcon"
import clsCard from "../CardWhiteDef.module.css"
import ItemRow from "./ItemRow"



interface Props {
	store?: ViewLogStore
	style?: React.CSSProperties,
}

const LogsView: FunctionComponent<Props> = ({
	store: viewLogSo,
	style,
}) => {

	// STORE
	const viewLogSa = useStore(viewLogSo)
	const logSa = useStore(logSo)

	// HOOKs
	const virtuoso = useRef(null);

	// HANDLER
	const handleMessageClick = (log: Log) => viewLogSo.select(log)
	const handleClear = () => logSo.clear()

	// RENDER
	const allLogs = logSa.all
	if (!allLogs) return <div>no messages</div>

	return <FrameworkCard
		icon={<LogIcon />}
		className={clsCard.root}
		store={viewLogSo}
		actionsRender={<>
			<Button
				children="CLEAR"
				onClick={handleClear}
			/>
		</>}
	>
		<Virtuoso
			ref={virtuoso}
			style={{ height: "100%" }}

			// KEEP DOWN
			initialTopMostItemIndex={allLogs?.length - 1}
			//atBottomStateChange={handleBottomChange}
			followOutput={'auto'}

			// LOADING
			//startReached={handleStartReached}
			//endReached={handleEndReached}
			//atTopStateChange={handleTopChange}

			// RENDERING
			data={allLogs}
			//computeItemKey={(index, item: Message) => item.seqNum}
			totalCount={allLogs?.length ?? 0}
			//overscan={200}
			defaultItemHeight={96}
			itemContent={(index, log) => (
				<ItemRow
					log={log}
					index={index}
					onClick={handleMessageClick}
				/>
			)}
		/>
	</FrameworkCard>
}

export default LogsView

