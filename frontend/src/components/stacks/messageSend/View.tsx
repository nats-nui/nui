import Button from "@/components/buttons/Button"
import FloatButton from "@/components/buttons/FloatButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode from "@/components/editor"
import FormatAction from "@/components/editor/FormatAction"
import TextInput from "@/components/input/TextInput"
import CircularLoadingCmp from "@/components/loaders/CircularLoadingCmp"
import SendIcon from "@/icons/SendIcon"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/connection/messageSend"
import { LOAD_STATE } from "@/stores/stacks/utils"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import FormatDialog from "../../editor/FormatDialog"
import SubjectsDialog from "./SubjectsDialog"



interface Props {
	store?: MessageSendStore
}

const MessageSendView: FunctionComponent<Props> = ({
	store: sendSo,
}) => {

	// STORE
	const sendSa = useStore(sendSo) as MessageSendState

	// HOOKs

	// HANDLER
	const handleSend = () => sendSo.publish()
	const handleValueChange = (value: string) => sendSo.setText(value)
	const handleSubsClick = (e: React.MouseEvent, select?: boolean) => {
		if (select) return
		sendSo.setSubsOpen(!select)
	}
	const handleSubjectChange = (value: string) => sendSo.setSubject(value)

	// RENDER
	const canSend = sendSo.getCanEdit()
	const inLoading = sendSa.loadingState == LOAD_STATE.LOADING

	return <FrameworkCard
		store={sendSo}
		actionsRender={<>

			<FormatAction store={sendSo} />
			<div className="lbl-divider-v2" />

			<Button
				select={sendSa.subsOpen}
				children="SUBJECT"
				onClick={handleSubsClick}
			/>
			<Button
				children="SEND"
				onClick={handleSend}
				disabled={!canSend}
			/>
		</>}
	>
		<div className="lyt-form" style={{ height: "100%" }}>
			
			<div className="lyt-v">
				<div className="lbl-prop cliccable"
					onClick={handleSubsClick}
				>SUBJECT</div>
				<TextInput autoFocus
					placeholder="Click SUBJECT button or write here e.g. orders.>"
					value={sendSa.subject}
					onChange={handleSubjectChange}
				/>
			</div>
			<EditorCode
				ref={ref => sendSa.editorRef = ref}
				format={sendSa.format}
				value={sendSo.getEditorText()}
				onChange={handleValueChange}
			/>

			<div className="lyt-float">
				<FloatButton style={{ position: "relative" }}
					onClick={handleSend}
					disabled={!canSend}
				>
					{inLoading
						? <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
						: <SendIcon />
					}
				</FloatButton>
			</div>
		</div>

		<SubjectsDialog store={sendSo} />
		<FormatDialog store={sendSo} editMode />

	</FrameworkCard>

}

export default MessageSendView
