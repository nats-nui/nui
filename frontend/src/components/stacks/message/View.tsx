import FrameworkCard from "@/components/cards/FrameworkCard"
import MyEditor from "@/components/editor"
import FormatAction from "@/components/editor/FormatAction"
import Form from "@/components/format/Form"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import FormatDialog from "../../editor/FormatDialog"
import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import CopyIcon from "@/icons/CopyIcon"
import cls from "./View.module.css"
import dayjs from "dayjs"
import { dateShow } from "@/utils/time"


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
	const [bttCopyVisible, setBttCopyVisible] = useState(false)

	// HANDLER
	const handleClipboardClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
		navigator.clipboard.writeText(msgSa.message.subject)
	}

	// RENDER
	const timestamp = dateShow(msgSa.message.receivedAt)

	return <FrameworkCard
		store={msgSo}
		actionsRender={<>
			<FormatAction store={msgSo} />
		</>}
	>
		<Form className={cls.form}>
			<div
				onMouseEnter={() => setBttCopyVisible(true)}
				onMouseLeave={() => setBttCopyVisible(false)}
			>
				{bttCopyVisible && (
					<TooltipWrapCmp content="COPY" className={cls.boxActions}>
						<IconButton onClick={handleClipboardClick}>
							<CopyIcon />
						</IconButton>
					</TooltipWrapCmp>
				)}

				<span className="lbl-prop">SUBJECT: </span>
				<span className="lbl-input-readonly">
					{msgSa.message.subject}
				</span>
			</div>

			<MyEditor autoFormat readOnly
				ref={ref => msgSa.editorRef = ref}
				format={msgSa.format}
				value={msgSo.getEditorText()}
			/>

			<div className={cls.timestamp}>{timestamp}</div>
		</Form>

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessageView
