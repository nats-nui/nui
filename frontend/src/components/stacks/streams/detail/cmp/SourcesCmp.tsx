import { newSource } from "@/stores/stacks/streams/utils/factory"
import { Source } from "@/types/Stream"
import { EditItemRow, EditList, ElementDialog, LIST_ACTIONS, ViewStore } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useRef, useState } from "react"
import EditSourceCmp from "./EditSourceCmp"



interface Props {
	store?: ViewStore //StreamStore
	sources: Source[]
	allStreams?: string[]
	onChangeSources?: (source: Source[]) => void
	readOnly?: boolean
}

const SourcesCmp: FunctionComponent<Props> = ({
	store: streamSo,
	sources = [],
	allStreams,
	onChangeSources,
	readOnly = false,
}) => {

	const haveNew = () => sources?.some(s => !(s.name?.length > 0))

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
		// config.sources = sources
		// streamSo.setStream({ ...streamSa.stream })
		onChangeSources?.(sources)
		if (action == LIST_ACTIONS.DELETE) handleSelectChange(-1)
	}

	const handleSourceChange = (source: Source) => {
		// config.sources[souceIndex] = source
		// streamSo.setStream({ ...streamSa.stream })
		sources[souceIndex] = source
		onChangeSources?.(sources)
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
		return newSource();
	}

	// RENDER
	//const config: StreamConfig = streamSa.stream?.config
	//if (config == null) return null
	//const sources = config.sources ?? []
	//const inRead = streamSa.editState == EDIT_STATE.READ
	//const allStreams = streamSa.allStreams
	if ( sources == null) return null

	return <>
		<EditList<Source> ref={listRef} keepSelectOnBlur toggleSelect
			items={sources}
			select={souceIndex}
			readOnly={readOnly}
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
			width={280}
			timeoutClose={0}
			onClose={handleDialogClose}
		>
			<EditSourceCmp
				source={sources?.[souceIndex]}
				onChange={handleSourceChange}
				allStream={allStreams}
				readOnly={readOnly}
			/>
		</ElementDialog>
	</>
}

export default SourcesCmp
