import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode from "@/components/editor"
import FormatDialog from "@/components/editor/FormatDialog"
import HeadersCmp from "@/components/stacks/message/HeadersCmp.tsx"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import FormatIcon from "@/icons/FormatIcon"
import SendIcon from "@/icons/SendIcon"
import sync, { SyncStore } from "@/stores/stacks/sync"
import { LOAD_STATE } from "@/stores/stacks/utils"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useRef } from "react"
import SyncIcon from "../../../icons/SyncIcon"
import EditMetadataRow from "../../rows/EditMetadataRow"
import clsCardRedeye from "../CardCyanDef.module.css"
import clsCardBoring from "../CardBoringDef.module.css"
import layoutSo from "@/stores/layout"
import cls from "./View.module.css"
import { Button, CircularLoadingCmp, EditList, FloatButton, IconButton, TextInput, TitleAccordion, TooltipWrapCmp } from "@priolo/jack"
import OptionsDialog from "@/components/stacks/sync/OptionsDialog.tsx";



interface Props {
	store?: SyncStore
}

const SyncView: FunctionComponent<Props> = ({
	store: syncSo,
}) => {

	// STORE
	const syncSa = useStore(syncSo)
	useStore(layoutSo)
	const refSender = useRef(null)
	const refReceiver = useRef(null)

	// HOOKs

	// HANDLER
	const handleSendChange = (value: string) => syncSo.setMessageSend(value)
	const handleSubjectChange = (value: string) => syncSo.setSubject(value)
	const handleSend = () => syncSo.send()
	const handleFormat = () => {
		refSender.current?.format()
		// timeout altrimenti non lo formatta se formatta il precedente!!!
		setTimeout(refReceiver.current?.format, 300)
	}
	const handleOptionsClick = (e: React.MouseEvent, select?: boolean) => {
		if (select) return
		syncSo.setOptionsOpen(!select)
	}
	const handleMessageClick = (txt: string) => syncSo.openMessageDetail({
		payload: txt,
		subject: syncSo.state.subject,
		receivedAt: Date.now(),
	})
	const handleRequestClick = () => handleMessageClick(syncSo.state.messageSend)
	const handleResponseClick = () => handleMessageClick(syncSo.state.messageReceived)
	const handleHeaderChange = (headers: [string, string][]) => syncSo.setHeaders(headers)

	// RENDER
	const canSend = syncSo.getCanSend()
	const inLoading = syncSa.loadingState == LOAD_STATE.LOADING
	const noHeaders = !syncSa.headersReceived || Object.keys(syncSa.headersReceived).length == 0
	const headersTitle = noHeaders ? "WITHOUT HEADERS" : "HEADERS"
	const clsCard = layoutSo.state.theme == "redeye" ? clsCardRedeye : clsCardBoring

	return <FrameworkCard
		className={clsCard.root}
		icon={<SyncIcon />}
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
			<Button
				select={syncSa.optionsOpen}
				children={"OPTIONS"}
				onClick={() => syncSo.setOptionsOpen(true)}
			/>
			<div style={{ height: "20px", width: "2px", backgroundColor: "rgba(255,255,255,.3)" }} />
			<Button
				children="SEND"
				onClick={handleSend}
				disabled={!canSend}
			/>
		</>}
	>
		<div className="jack-lyt-form" style={{ flex: 1 }}>

			<div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative", gap: 5 }} >

				<div className="lyt-v">

					<TitleAccordion title="HEADERS" open={false}>
						<EditList<[string, string]>
							items={syncSa.headers}
							onItemsChange={handleHeaderChange}
							//readOnly={inRead}
							placeholder="ex. 10"
							onNewItem={() => ["", ""]}
							fnIsVoid={m => !m || (m[0] == "" && m[1] == "")}
							RenderRow={EditMetadataRow}
						/>
					</TitleAccordion>

					<div className={cls.row}>
						<div className="jack-lbl-prop">SUBJECT</div>
						<IconButton onClick={handleRequestClick}>
							<ArrowRightIcon />
						</IconButton>
					</div>

					<TextInput autoFocus
						placeholder="Write here e.g. foo.bar"
						value={syncSa.subject}
						onChange={handleSubjectChange}
					/>
				</div>

				<div style={{ flex: 1, height: 0 }} >
					<EditorCode ref={refSender}
						format={syncSa.format}
						value={syncSa.messageSend}
						onChange={handleSendChange}
					/>
				</div>

				<div className="jack-lyt-float">
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
				<div className={cls.row}>
					<div className="jack-lbl-prop">RESPONSE</div>
					<IconButton onClick={handleResponseClick}>
						<ArrowRightIcon />
					</IconButton>
				</div>

				<TitleAccordion title={headersTitle} open={false} disabled={noHeaders}>
					<HeadersCmp headers={syncSa.headersReceived} />
				</TitleAccordion>

				<div style={{ flex: 1, height: 0 }} >
					<EditorCode ref={refReceiver}
						format={syncSa.format}
						value={syncSa.messageReceived}
						readOnly={true}
					/>
				</div>

			</div>
		</div>

		<FormatDialog editMode store={syncSo} />
		<OptionsDialog store={syncSo}/>
	</FrameworkCard>
}

export default SyncView
