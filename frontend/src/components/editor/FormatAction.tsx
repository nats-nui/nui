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
	const storeSa = useStore(store)

	// HOOKs

	// HANDLER
	const handleOpenDialogFormats = () => store.setFormatsOpen(true)
	const handleFormat = () => storeSa.editorRef.format()

	// RENDER
	const formatLabel = storeSa.format?.toUpperCase() ?? ""

	return <>
		<CopyButton value={()=>store.getEditorText()} />
		<TooltipWrapCmp content="FORMAT">
			<IconButton effect
				onClick={handleFormat}
			><FormatIcon /></IconButton>
		</TooltipWrapCmp>
		<Button
			select={storeSa.formatsOpen}
			children={formatLabel}
			onClick={handleOpenDialogFormats}
		/>
	</>
}

export default FormatAction
