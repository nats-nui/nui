import { EditorStore } from "@/stores/stacks/editorBase"
import { MSG_FORMAT, MSG_FORMAT_EDIT } from "@/utils/editor"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import Dialog from "../dialogs/Dialog"
import List from "../lists/List"



interface Props {
	store?: EditorStore
	editMode?: boolean
}

const FormatDialog: FunctionComponent<Props> = ({
	store,
	editMode,
}) => {

	// STORE
	const formatSa = useStore(store as any) as typeof store.state

	// HOOKs

	// HANDLER
	const handleClose = () => {
		store.setFormatsOpen(false)
	}
	const handleSelect = (index: number) => {
		store.setFormat(formats[index])
		store.setFormatsOpen(false)
	}

	// RENDER
	const formats = useMemo(() => Object.values(editMode ? MSG_FORMAT_EDIT : MSG_FORMAT), [editMode])
	const indexSelect = useMemo(() => formats.indexOf(formatSa.format), [formatSa.format])

	return (
		<Dialog
			open={formatSa.formatsOpen}
			title="FORMATS"
			width={90}
			store={store as any}
			onClose={handleClose}
		>
			<List<string>
				items={formats}
				select={indexSelect}
				onSelect={handleSelect}
			/>
		</Dialog>
	)
}

export default FormatDialog
