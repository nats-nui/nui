import FrameworkCard from "@/components/cards/FrameworkCard"
import { ViewLogStore } from "@/stores/stacks/log"
import { Log } from "@/stores/log/utils"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useRef } from "react"
import { Virtuoso } from "react-virtuoso"
import ItemRow from "./ItemRow"
import logSo from "@/stores/log"
import Button from "@/components/buttons/Button"



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
	const variant = viewLogSa.colorVar

	return <FrameworkCard
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

