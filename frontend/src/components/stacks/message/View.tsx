import FrameworkCard from "@/components/cards/FrameworkCard"
import MyEditor from "@/components/editor"
import FormatAction from "@/components/editor/FormatAction"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import FormatDialog from "../../editor/FormatDialog"



interface Props {
	store?: MessageStore
}

/** dettaglio di un messaggio */
const MessageView: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessageState

	// HOOKs

	// HANDLER

	// RENDER

	return <FrameworkCard
		store={msgSo}
		actionsRender={<>
			<FormatAction store={msgSo} />
		</>}
	>
		<Form style={{ height: "100%" }}>
			<BoxV>
				<div className="lbl-prop">SUBJECT</div>
				<div className="lbl-input-readonly">
					{msgSa.message.subject}
				</div>
			</BoxV>

			<MyEditor autoFormat readOnly
				ref={ref => msgSa.editorRef = ref}
				format={msgSa.format}
				value={msgSo.getEditorText()}
			/>
		</Form>

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessageView
