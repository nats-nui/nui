import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import EditList from "@/components/lists/EditList"
import List, { RenderRowBaseProps } from "@/components/lists/List"
import EditSubscriptionRow from "@/components/rows/EditSubscriptionRow"
import cnnSo from "@/stores/connections"
import { MessageStat, MessagesState, MessagesStore } from "@/stores/stacks/connection/messages"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import Dialog from "../../../dialogs/Dialog"
import cls from "./SubjectsDialog.module.css"
import dayjs from "dayjs"
import TitleAccordion from "@/components/accordion/TitleAccordion"



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

	useEffect(() => {
		if (!msgSa.subscriptionsOpen) return
		const cnn = cnnSo.getById(msgSa.connectionId)
		const subs = msgSa.subscriptions.map<Subscription>(sub => ({
			...sub,
			favorite: !!cnn.subscriptions.find(s => s.subject == sub.subject),
		}))
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
		const cnn = cnnSo.getById(msgSa.connectionId)
		const newSubs = subscriptions.reduce((acc, sub) => {
			const index = acc.findIndex(s => s.subject == sub.subject)
			if (index != -1 && !sub.favorite) acc.splice(index, 1)
			if (index == -1 && sub.favorite) acc.push(sub)
			return acc
		}, [...cnn.subscriptions])
		cnnSo.update({ id: msgSa.connectionId, subscriptions: newSubs })
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
	//const stats = Object.values(msgSa.stats).sort((s1, s2) => s1.subject.localeCompare(s2.subject))
	const stats = Object.values(msgSa.stats).sort((s1, s2) => s2.counter - s1.counter)

	return <Dialog

		timeoutClose={-1}
		title={<div style={{ display: "flex", alignItems: "center" }}>
			<IconToggle style={{ marginTop: 3, marginRight: 6 }}
				check={allCheck}
				onChange={handleAllDisable}
			/>
			SUBJECTS
		</div>}
		width={300}
		open={msgSa.subscriptionsOpen}
		store={msgSo}
		onClose={handleCancel}
	>
		<EditList<Subscription>
			items={subscriptions}
			onItemsChange={handleChangeSubs}
			onNewItem={() => ({ subject: "", disabled: false, favorite: true })}
			fnIsVoid={(item) => !(item?.subject) || item.subject.length == 0}
			RenderRow={EditSubscriptionRow}
		/>

		<TitleAccordion title="STATS">
			<List<MessageStat>
				className={cls.list}
				items={stats}
				onSelect={handleStatsSelect}
				RenderRow={MessageStatRow}
			/>
		</TitleAccordion>

		{/* <div className="lbl-prop-title" style={{ marginTop: 5 }}>STATS</div> */}

		{/* <div className="lyt-v" style={{ marginTop: 5 }}>
			<div className="lbl-prop">STATS</div> */}
		{/* <List<MessageStat>
			className={cls.list}
			items={stats}
			onSelect={handleStatsSelect}
			RenderRow={MessageStatRow}
		/> */}
		{/* </div> */}

		<div className="var-dialog" style={{ display: "flex", gap: 15, marginTop: 10 }} >
			<Button children="CANCEL" onClick={handleCancel} />
			<Button children="OK" onClick={handleOk} />
			<div style={{ flex: 1 }} />
			<Button children="CLEAR STATS" onClick={handleClearStats} />
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
