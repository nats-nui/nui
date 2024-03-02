import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"
import Quote from "@/components/format/Quote"
import EditList from "@/components/lists/EditList"
import EditItemRow from "@/components/rows/EditItemRow"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { buildNewSource } from "@/stores/stacks/streams/utils/factory"
import { EDIT_STATE } from "@/types"
import { Source, StreamConfig } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useRef, useState } from "react"
import EditSourceCmp from "./EditSourceCmp"
import ElementDialog from "@/components/dialogs/ElementDialog"




interface Props {
	store?: StreamStore
}

const SourceCmp: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	const sourcesClear = () => {
		config.sources = config.sources.filter(s => s.name.length > 0)
		streamSo.setStream({ ...streamSa.stream })
	}
	const haveNew = () => config.sources.some(s => !(s.name?.length > 0))

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
	const handleSourceSelect = (index: number, e: React.BaseSyntheticEvent) => {
		setSourceIndex(index)
		if ( index == -1 ) {
			setElementSource(null)
			sourcesClear()
		} else {
			setElementSource(e.target)
		}
	}

	const handleSourcesChange = (sources: Source[]) => {
		config.sources = sources
		streamSo.setStream({ ...streamSa.stream })
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
		setElementSource(null)
		sourcesClear()
	}

	const handleNewSource = (index: number) => {
		if (haveNew()) return null
		return buildNewSource();
	}

	// RENDER
	if (streamSa.stream?.config == null) return null
	const config: StreamConfig = streamSa.stream.config
	const inRead = streamSa.editState == EDIT_STATE.READ
	const allStreams = streamSa.allStreams

	return <BoxV>
		<Label>SOURCES</Label>
		<Quote>
			<EditList<Source> ref={listRef}
				items={config.sources}
				readOnly={inRead}
				onChangeItems={handleSourcesChange}
				onSelect={handleSourceSelect}
				onNewItem={handleNewSource}
				RenderRow={(props) => <EditItemRow {...props} item={props.item?.name} />}
			/>
		</Quote>
		<ElementDialog
			title="SOURCE"
			element={elementSource}
			store={streamSo}
			width={250}
			timeoutClose={0}
			onClose={handleDialogClose}
		>
			<EditSourceCmp
				source={config.sources?.[souceIndex]}
				onChange={handleSourceChange}
				allStream={allStreams}
				readOnly={inRead}
			/>
		</ElementDialog>
	</BoxV>
}

export default SourceCmp

const cssList = (readOnly: boolean, variant: number): React.CSSProperties => ({
	backgroundColor: readOnly ? "rgb(0 0 0 / 50%)" : layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	color: layoutSo.state.theme.palette.var[variant].bg,
})