import TooltipWrapCmp from "@/components/tooltip/TooltipWrapCmp"
import Button from "@/components/buttons/Button"
import IconButton from "@/components/buttons/IconButton"
import FormatIcon from "@/icons/FormatIcon"
import { EditorStore } from "@/stores/stacks/editorBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import CopyButton from "../buttons/CopyButton"



interface Props {
	store?: EditorStore
}

/**
 * Set di bottoni per le CARD che hanno MONACO EDITOR
 */
const FormatAction: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs

	// HANDLER
	const handleOpenDialogFormats = () => store.setFormatsOpen(true)
	const handleFormat = () => {
		store.setAutoFormat(!autoFormat)
		// bisogna fare questo perche' l'update mi cambia editorRef che quindi punta ad un ref sbagliato
		if (!autoFormat) setTimeout(state.editorRef.format, 300)
	}

	// RENDER
	const formatLabel = state.format?.toUpperCase() ?? ""
	const autoFormat = store.state.autoFormat

	return <>
		<CopyButton value={() => store.getEditorText()} />
		<TooltipWrapCmp content="FORMAT">
			<IconButton effect
				select={autoFormat}
				onClick={handleFormat}
			><FormatIcon /></IconButton>
		</TooltipWrapCmp>
		<Button
			select={state.formatsOpen}
			children={formatLabel}
			onClick={handleOpenDialogFormats}
		/>
	</>
}

export default FormatAction
