import CopyButton from "@/components/buttons/CopyButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode, { EditorRefProps } from "@/components/editor"
import FormatAction from "@/components/editor/FormatAction"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { dateShow } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import TitleAccordion from "../../accordion/TitleAccordion"
import FormatDialog from "../../editor/FormatDialog"
import HeadersCmp from "./HeadersCmp"
import cls from "./View.module.css"



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
	const refEditor = (ref: EditorRefProps) => msgSa.editorRef = ref

	// RENDER
	const timestamp = dateShow(msgSa.message.receivedAt)
	const autoFormat = msgSa.autoFormat
	const noHeaders = !msgSa.message.headers || Object.keys(msgSa.message.headers).length == 0
	const headersTitle = noHeaders ? "WITHOUT HEADERS" : "HEADERS"

	return <FrameworkCard
		store={msgSo}
		actionsRender={<>
			<FormatAction store={msgSo} />
		</>}
	>
		<div className={`lyt-form ${cls.form}`}>

			<TitleAccordion title={headersTitle} open={false} disabled={noHeaders}>
				<HeadersCmp headers={msgSa.message.headers} />
			</TitleAccordion>

			<div className="hover-container">
				<CopyButton absolute
					value={msgSa.message.subject}
					style={{ backgroundColor: "var(--bg-default)" }}
				/>
				<span className="lbl-prop">SUBJECT2: </span>
				<span className="lbl-readonly">
					{msgSa.message.subject}
				</span>
			</div>

			<div style={{ flex: 1, height: 0 }} >
				<EditorCode readOnly
					autoFormat={autoFormat}
					ref={refEditor}
					format={msgSa.format}
					value={msgSo.getEditorText()}
				/>
			</div>

			<div className={cls.timestamp}>{timestamp}</div>
		</div>

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessageView


