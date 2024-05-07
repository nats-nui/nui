import TitleAccordion from "@/components/accordion/TitleAccordion"
import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import FindInput from "@/components/input/FindInput"
import EditList from "@/components/lists/EditList"
import List, { RenderRowBaseProps } from "@/components/lists/List"
import EditSubscriptionRow from "@/components/rows/EditSubscriptionRow"
import { MessageStat, MessagesState, MessagesStore } from "@/stores/stacks/connection/messages"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import dayjs from "dayjs"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import Dialog from "../../../dialogs/Dialog"
import cls from "./SubjectsDialog.module.css"



interface Props {
	store?: MessagesStore
}

const SubjectsDialog: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessagesState

	// HOOKs
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
	const [filter, setFilter] = useState<string>("")

	useEffect(() => {
		if (!msgSa.subscriptionsOpen) return
		const subs = msgSa.subscriptions ?? []
		setSubscriptions(subs.sort((s1, s2) => s1.subject.localeCompare(s2.subject)))
		return () => { msgSo.setSubscriptionsOpen(false) }
	}, [msgSa.subscriptionsOpen, msgSa.connectionId])

	// HANDLER
	const handleCancel = () => {
		msgSo.setSubscriptionsOpen(false)
	}
	const handleOk = () => {
		msgSo.setSubscriptionsOpen(false)
		msgSo.setSubscriptions(subscriptions)
		msgSo.sendSubscriptions()
		msgSo.updateSubscriptions()
	}
	const handleChangeSubs = (newSubs: Subscription[]) => {
		setSubscriptions(newSubs)
	}
	const handleAllDisable = (check: boolean) => {
		for (const sub of subscriptions) {
			sub.disabled = !check
		}
		setSubscriptions([...subscriptions])
	}
	const handleStatsSelect = (index: number) => {
		const subject = stats[index].subject
		if (subscriptions.findIndex(s => s.subject == subject) != -1) return
		subscriptions.push({
			subject,
			disabled: false,
			favorite: false,
		})
		setSubscriptions([...subscriptions])
	}
	const handleClearStats = () => {
		msgSo.setStats({})
	}

	// RENDER
	const allCheck = useMemo(() => subscriptions.every(s => !s.disabled), [subscriptions])
	const stats = useMemo(() => {
		const txt = filter.toLowerCase().trim()
		return Object.values(msgSa.stats)
			.filter(m => txt.length == 0 || m.subject?.toLowerCase().includes(txt))
			.sort((s1, s2) => s1.subject.localeCompare(s2.subject))
	}, [filter, msgSa.stats, msgSa.messages])
	const noStats = !stats || stats.length == 0

	return <Dialog noCloseOnClickParent
		title={<div style={{ display: "flex", alignItems: "center" }}>
			<IconToggle style={{ marginTop: 3, marginRight: 6 }}
				check={allCheck}
				onChange={handleAllDisable}
			/>
			SUBJECTS
		</div>}
		store={msgSo}
		width={250}
		open={msgSa.subscriptionsOpen}
		onClose={handleCancel}
	>
		<div className="lyt-form var-dialog">

			<EditList<Subscription>
				items={subscriptions}
				onItemsChange={handleChangeSubs}
				onNewItem={() => ({ subject: "", disabled: false, favorite: true })}
				fnIsVoid={(item) => !(item?.subject) || item.subject.length == 0}
				RenderRow={EditSubscriptionRow}
			/>

			<TitleAccordion title="STATS" open={false}>
				{!noStats &&
					<FindInput
						style={{ margin: "5px 0px", flex: 0 }}
						value={filter}
						onChange={text => setFilter(text)}
					/>
				}
				<List<MessageStat>
					className={cls.list}
					items={stats}
					onSelect={handleStatsSelect}
					RenderRow={MessageStatRow}
				/>
			</TitleAccordion>

			<div className="cmp-h" style={{ marginTop: 10 }}>
				<IconToggle
					check={msgSa.noSysMessages}
					onChange={() => msgSo.setNoSysMessages(!msgSa.noSysMessages)}
				/>
				<div className="lbl-prop">DISCARDS SYSTEM MESSAGES</div>
			</div>

			<div className="var-dialog cmp-footer">
				<Button children="OK" onClick={handleOk} />
				<Button children="CANCEL" onClick={handleCancel} />
				<div style={{ flex: 1 }} />
				<Button children="CLEAR STATS" onClick={handleClearStats} />
			</div>

		</div>
	</Dialog>
}

export default SubjectsDialog

const MessageStatRow: FunctionComponent<RenderRowBaseProps<MessageStat>> = ({
	item,
}) => {

	const time = useMemo(() => dayjs(item.last).format("YYYY-MM-DD HH:mm:ss"), [item.last])

	return <div className={cls.row}>
		<div className={cls.row_sbj}>{item.subject}</div>
		<div style={{ display: "flex" }}>
			<div className={cls.row_counter}>{item.counter}</div>
			<div style={{ flex: 1 }} />
			<div className={cls.row_time}>{time}</div>
		</div>
	</div>
}
