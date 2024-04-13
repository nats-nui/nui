import ElementDialog from "@/components/dialogs/ElementDialog"
import EditList, { LIST_ACTIONS } from "@/components/lists/EditList"
import EditItemRow from "@/components/rows/EditItemRow"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { buildNewSource } from "@/stores/stacks/streams/utils/factory"
import { EDIT_STATE } from "@/types"
import { Source, StreamConfig } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useRef, useState } from "react"
import EditSourceCmp from "./EditSourceCmp"



interface Props {
	store?: StreamStore
}

const SourcesCmp: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	const haveNew = () => config.sources?.some(s => !(s.name?.length > 0))

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs
	// indica praticamente se la dialog è aperta o no
	const [elementSource, setElementSource] = useState<HTMLElement>(null)
	// indice selezionato probabilmente da sostituire con id
	const [souceIndex, setSourceIndex] = useState<number>(null)
	// riferimento alla lista cosi' se clicco su di essa la dialog non si chiude
	const listRef = useRef(null)

	// HANDLER

	const handleSelectChange = (index: number, e?: React.BaseSyntheticEvent) => {
		setElementSource(index == -1 ? null : e.target)
		setSourceIndex(index)
	}

	const handleSourcesChange = (sources: Source[], action: LIST_ACTIONS) => {
		config.sources = sources
		streamSo.setStream({ ...streamSa.stream })
		if (action == LIST_ACTIONS.DELETE) handleSelectChange(-1)
	}

	const handleSourceChange = (source: Source) => {
		config.sources[souceIndex] = source
		streamSo.setStream({ ...streamSa.stream })
	}

	const handleDialogClose = (e) => {
		// se clicco sulla lista stessa allora non chiudere nulla
		//if (listRef && listRef.current.contains(e.target)) return
		const rect = listRef.current.getBoundingClientRect();
		const x = e.clientX;
		const y = e.clientY;
		if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return
		handleSelectChange(-1)
	}

	const handleNewSource = (index: number) => {
		if (haveNew()) return null
		return buildNewSource();
	}

	// RENDER
	const config: StreamConfig = streamSa.stream?.config
	if (config == null) return null
	const sources = config.sources ?? []
	const inRead = streamSa.editState == EDIT_STATE.READ
	const allStreams = streamSa.allStreams

	return <>
		<EditList<Source> ref={listRef} keepSelectOnBlur toggleSelect
			items={sources}
			select={souceIndex}
			readOnly={inRead}
			onItemsChange={handleSourcesChange}
			onSelectChange={handleSelectChange}
			onNewItem={handleNewSource}
			RenderRow={(props) => <EditItemRow {...props} item={props.item?.name} />}
			fnIsVoid={item => !item.name || item.name.trim().length == 0}
		/>
		<ElementDialog
			title="SOURCE"
			element={elementSource}
			store={streamSo}
			width={250}
			timeoutClose={0}
			onClose={handleDialogClose}
		>
			<EditSourceCmp
				source={sources?.[souceIndex]}
				onChange={handleSourceChange}
				allStream={allStreams}
				readOnly={inRead}
			/>
		</ElementDialog>
	</>
}

export default SourcesCmp
