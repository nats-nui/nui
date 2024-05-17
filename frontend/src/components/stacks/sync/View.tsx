import Button from "@/components/buttons/Button"
import FloatButton from "@/components/buttons/FloatButton"
import IconButton from "@/components/buttons/IconButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode from "@/components/editor"
import FormatDialog from "@/components/editor/FormatDialog"
import TextInput from "@/components/input/TextInput"
import CircularLoadingCmp from "@/components/loaders/CircularLoadingCmp"
import TooltipWrapCmp from "@/components/tooltip/TooltipWrapCmp"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import FormatIcon from "@/icons/FormatIcon"
import SendIcon from "@/icons/SendIcon"
import { SyncStore } from "@/stores/stacks/sync"
import { LOAD_STATE } from "@/stores/stacks/utils"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useRef } from "react"
import cls from "./View.module.css"



interface Props {
	store?: SyncStore
	style?: React.CSSProperties,
}

const SyncView: FunctionComponent<Props> = ({
	store: syncSo,
	style,
}) => {

	// STORE
	const syncSa = useStore(syncSo)
	const refSender = useRef(null)
	const refReceiver = useRef(null)

	// HOOKs

	// HANDLER
	const handleSendChange = (value: string) => syncSo.setMessageSend(value)
	const handleSubjectChange = (value: string) => syncSo.setSubject(value)
	const handleSend = () => syncSo.send()
	const handleFormat = () => {
		refSender.current?.format()
		refReceiver.current?.format()
	}
	const handleMessageClick = (txt: string) => syncSo.openMessageDetail({
		payload: txt,
		subject: syncSo.state.subject,
		receivedAt: Date.now(),
	})
	const handleRequestClick = () => handleMessageClick(syncSo.state.messageSend)
	const handleResponseClick = () => handleMessageClick(syncSo.state.messageReceived)

	// RENDER
	const canSend = syncSo.getCanSend()
	const inLoading = syncSa.loadingState == LOAD_STATE.LOADING

	return <FrameworkCard
		store={syncSo}
		actionsRender={<>

			<TooltipWrapCmp content="FORMAT">
				<IconButton effect onClick={handleFormat} >
					<FormatIcon />
				</IconButton>
			</TooltipWrapCmp>
			<Button
				select={syncSa.formatsOpen}
				children={syncSa.format?.toUpperCase() ?? ""}
				onClick={() => syncSo.setFormatsOpen(true)}
			/>
			<div style={{ height: "20px", width: "2px", backgroundColor: "rgba(255,255,255,.3)" }} />
			<Button
				children="SEND"
				onClick={handleSend}
				disabled={!canSend}
			/>
		</>}
	>
		<div className="lyt-form" style={{ flex: 1 }}>

			<div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative", gap: 5 }} >

				<div className="lyt-v">
					<div className={cls.response}>
						<div className="lbl-prop">SUBJECT</div>
						<IconButton onClick={handleRequestClick}>
							<ArrowRightIcon />
						</IconButton>
					</div>
					<TextInput autoFocus
						placeholder="Write here e.g. persons.ivano"
						value={syncSa.subject}
						onChange={handleSubjectChange}
					/>
				</div>

				<EditorCode ref={refSender}
					format={syncSa.format}
					value={syncSa.messageSend}
					onChange={handleSendChange}
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

			<div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 5 }}>
				<div className={cls.response}>
					<div className="lbl-prop">RESPONSE</div>
					<IconButton onClick={handleResponseClick}>
						<ArrowRightIcon />
					</IconButton>
				</div>
				<EditorCode ref={refReceiver}
					format={syncSa.format}
					value={syncSa.messageReceived}
					readOnly={true}
				/>
			</div>
		</div>

		<FormatDialog editMode store={syncSo} />

	</FrameworkCard>
}

export default SyncView
