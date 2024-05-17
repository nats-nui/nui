import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode from "@/components/editor"
import FormatAction from "@/components/editor/FormatAction"
import { EditorCodeState, EditorCodeStore } from "@/stores/stacks/editorCode"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import FormatDialog from "../../editor/FormatDialog"
import cls from "./View.module.css"


interface Props {
	store?: EditorCodeStore
}

/** dettaglio di un messaggio */
const EditorCodeView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store) as EditorCodeState

	// HOOKs

	// HANDLER

	// RENDER

	return <FrameworkCard
		store={store}
		// actionsRender={<>
		// 	<FormatAction store={store} />
		// </>}
	>
		<div className={`lyt-form ${cls.form}`}>

			<EditorCode autoFormat readOnly
				//ref={ref => state.editorRef = ref}
				//format={state.format}
				value={store.state.code}
			/>

		</div>

		{/* <FormatDialog store={store} /> */}

	</FrameworkCard>
}

export default EditorCodeView
