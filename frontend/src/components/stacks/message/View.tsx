import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode, { EditorRefProps } from "@/components/editor"
import FormatAction from "@/components/editor/FormatAction"
import { MessageStore } from "@/stores/stacks/message"
import { dateShow } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import MessageIcon from "../../../icons/cards/MessageIcon"
import FormatDialog from "../../editor/FormatDialog"
import clsCard from "../CardCyanDef.module.css"
import HeadersCmp from "./HeadersCmp"
import cls from "./View.module.css"
import { CopyButton, TitleAccordion } from "@priolo/jack"



interface Props {
	store?: MessageStore
}

/** dettaglio di un messaggio */
const MessageView: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo)

	// HOOKs

	// HANDLER
	const refEditor = (ref: EditorRefProps) => msgSa.editorRef = ref

	// RENDER
	const timestamp = dateShow(msgSa.message.receivedAt)
	const autoFormat = msgSa.autoFormat
	const noHeaders = !msgSa.message.headers || Object.keys(msgSa.message.headers).length == 0
	const headersTitle = noHeaders ? "WITHOUT HEADERS" : "HEADERS"

	return <FrameworkCard
		className={clsCard.root}
		icon={<MessageIcon />}
		store={msgSo}
		actionsRender={<>
			<FormatAction store={msgSo} />
		</>}
	>
		<div className={`jack-lyt-form ${cls.form}`}>

			<TitleAccordion title={headersTitle} open={false} disabled={noHeaders}>
				<HeadersCmp headers={msgSa.message.headers} />
			</TitleAccordion>

			<div className="jack-hover-container">
				<CopyButton absolute
					value={msgSa.message.subject}
					style={{ backgroundColor: "var(--card-bg)" }}
				/>
				<span className="jack-lbl-prop">SUBJECT: </span>
				<span className="jack-lbl-readonly">
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


