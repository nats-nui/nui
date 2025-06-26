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
import { CopyButton, IconButton, TitleAccordion } from "@priolo/jack"
import LinkDownIcon from "../../../icons/LinkDownIcon"
import { DOC_TYPE } from "../../../types"



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
	const handleLinkLastClick = () => msgSo.setLinkToLast(!msgSo.state.linkToLast)

	// RENDER
	const timestamp = dateShow(msgSa.message.receivedAt)
	const autoFormat = msgSa.autoFormat
	const noHeaders = !msgSa.message.headers || Object.keys(msgSa.message.headers).length == 0
	const headersTitle = noHeaders ? "WITHOUT HEADERS" : "HEADERS"
	const haveParent = msgSo.state.parent?.state?.type == DOC_TYPE.MESSAGES || msgSo.state.parent?.state?.type == DOC_TYPE.STREAM_MESSAGES
	const linkToLast = haveParent && msgSo.state.linkToLast

	return <FrameworkCard
		className={clsCard.root}
		icon={<MessageIcon />}
		store={msgSo}
		actionsRender={<>
			{haveParent && <IconButton
				select={linkToLast}
				onClick={handleLinkLastClick}
			><LinkDownIcon /></IconButton>}
			<div style={{ flex: 1 }} />
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

			<div style={{ display: "flex", justifyContent: 'space-between' }}>
				<div className={cls.timestamp}>[{msgSa.message?.seqNum}]</div>
				<div className={cls.timestamp}>{timestamp}</div>
			</div>

		</div>

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessageView


