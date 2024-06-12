import CopyButton from "@/components/buttons/CopyButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode, { EditorRefProps } from "@/components/editor"
import FormatAction from "@/components/editor/FormatAction"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { dateShow } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import FormatDialog from "../../editor/FormatDialog"
import cls from "./View.module.css"
import TitleAccordion from "../../accordion/TitleAccordion"



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
	// const headers: [string, string][] = useMemo(() => {
	// 	if (!msgSa.message.headers) return []
	// 	return Object
	// 		.entries(msgSa.message.headers)
	// 		.reduce<[string, string][]>((acc, [key, values]) => {
	// 			return acc.concat(values.map(v => [key, v]))
	// 		}, [])
	// }, [msgSa.message.headers])
	const timestamp = dateShow(msgSa.message.receivedAt)
	const autoFormat = msgSa.autoFormat

	return <FrameworkCard
		store={msgSo}
		actionsRender={<>
			<FormatAction store={msgSo} />
		</>}
	>
		<div className={`lyt-form ${cls.form}`}>

			<TitleAccordion title="HEADER" open={false}>
				{/* {headers.map(([key, values]) => <div className={`${cls.header} hover-container`}>
					<div className={cls.key}>{key}</div>:
					<div className={cls.values}>{values}</div>
					<CopyButton absolute
						value={values}
					//style={{ backgroundColor: "var(--bg-default)" }}
					/>
				</div>)} */}
				{Object.entries(msgSa.message.headers).map(([key, values]) => <div className={cls.header}>
					<div className={cls.key}>{key}</div>
					<div>:</div>
					<div className={cls.row}>
						{values.map(value => <div className={`${cls.header} hover-container`}>
							<div className={cls.values}>{value}</div>
							<CopyButton absolute
								value={value}
							//style={{ backgroundColor: "var(--bg-default)" }}
							/>
						</div>)}
					</div>
				</div>)}


			</TitleAccordion>

			<div className="hover-container">
				<CopyButton absolute
					value={msgSa.message.subject}
					style={{ backgroundColor: "var(--bg-default)" }}
				/>
				<span className="lbl-prop">SUBJECT: </span>
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


