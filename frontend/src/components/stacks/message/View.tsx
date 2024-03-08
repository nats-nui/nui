import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import MyEditor from "@/components/editor"
import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import FormatDialog from "../../editor/FormatDialog"
import IconButton from "@/components/buttons/IconButton"
import FormatIcon from "@/icons/FormatIcon"
import CopyIcon from "@/icons/CopyIcon"
import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import FormatAction from "@/components/editor/FormatAction"
import Form from "@/components/format/Form"



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
