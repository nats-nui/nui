import EditSubscriptionRow from "@/components/rows/EditSubscriptionRow"
import { MessageStat, MessagesState, MessagesStore, SubscriptionHistoryEntry } from "@/stores/stacks/connection/messages"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import dayjs from "dayjs"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import cls from "./SubjectsDialog.module.css"
import { Button, Dialog, EditList, FindInput, IconToggle, List, NumberInput, TitleAccordion } from "@priolo/jack"
import { RenderRowBaseProps } from "@priolo/jack"

// Default values for subscription cleanup
const DEFAULT_TTL_MINUTES = 15
const DEFAULT_MAX_MESSAGES = 1000



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

	// Advanced options state
	const [ttlMinutes, setTtlMinutes] = useState<number>(DEFAULT_TTL_MINUTES)
	const [maxMessages, setMaxMessages] = useState<number>(DEFAULT_MAX_MESSAGES)
	const [sessionBased, setSessionBased] = useState<boolean>(true)

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
		// Apply advanced options to all subscriptions
		const subsWithOptions = subscriptions.map(sub => ({
			...sub,
			ttlMinutes,
			maxMessages,
			sessionBased,
		}))
		msgSo.setSubscriptions(subsWithOptions)
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
	const handleHistorySelect = (index: number) => {
		const entry = history[index]
		if (subscriptions.findIndex(s => s.subject == entry.subject) != -1) {
			// Already exists, just re-enable it
			const updated = subscriptions.map(s =>
				s.subject === entry.subject ? { ...s, disabled: false } : s
			)
			setSubscriptions(updated)
		} else {
			// Add as new subscription
			subscriptions.push({
				subject: entry.subject,
				disabled: false,
				favorite: false,
			})
			setSubscriptions([...subscriptions])
		}
	}
	const handleClearHistory = () => {
		msgSo.clearSubscriptionHistory()
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
	const history = msgSa.subscriptionHistory || []
	const noHistory = history.length === 0

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
		<div className="jack-lyt-form var-dialog">

			<EditList<Subscription>
				items={subscriptions}
				onItemsChange={handleChangeSubs}
				onNewItem={() => ({ subject: "", disabled: false, favorite: true })}
				fnIsVoid={(item) => !(item?.subject) || item.subject.length == 0}
				RenderRow={EditSubscriptionRow}
			/>

			<TitleAccordion title="ADVANCED" open={false}>
				<div className="jack-lyt-form" style={{ padding: "5px 0" }}>
					<div className="jack-cmp-h">
						<div className="jack-lbl-prop" style={{ minWidth: 120 }}>TTL (minutes)</div>
						<NumberInput
							style={{ flex: 1 }}
							value={ttlMinutes}
							onChange={v => setTtlMinutes(v ?? DEFAULT_TTL_MINUTES)}
							min={1}
							max={480}
						/>
					</div>
					<div className="jack-cmp-h">
						<div className="jack-lbl-prop" style={{ minWidth: 120 }}>Max Messages</div>
						<NumberInput
							style={{ flex: 1 }}
							value={maxMessages}
							onChange={v => setMaxMessages(v ?? DEFAULT_MAX_MESSAGES)}
							min={1}
							max={100000}
						/>
					</div>
					<div className="jack-cmp-h">
						<IconToggle
							check={sessionBased}
							onChange={() => setSessionBased(!sessionBased)}
						/>
						<div className="jack-lbl-prop">Remove on disconnect</div>
					</div>
				</div>
			</TitleAccordion>

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

			{!noHistory && (
				<TitleAccordion title="HISTORY (EXPIRED)" open={false}>
					<List<SubscriptionHistoryEntry>
						className={cls.list}
						items={history}
						onSelect={handleHistorySelect}
						RenderRow={HistoryEntryRow}
					/>
					<Button
						style={{ marginTop: 5, fontSize: 10 }}
						children="CLEAR HISTORY"
						onClick={handleClearHistory}
					/>
				</TitleAccordion>
			)}

			<div className="jack-cmp-h" style={{ marginTop: 10 }}>
				<IconToggle
					check={msgSa.noSysMessages}
					onChange={() => msgSo.setNoSysMessages(!msgSa.noSysMessages)}
				/>
				<div className="jack-lbl-prop">DISCARDS SYSTEM MESSAGES</div>
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

const HistoryEntryRow: FunctionComponent<RenderRowBaseProps<SubscriptionHistoryEntry>> = ({
	item,
}) => {
	const time = useMemo(() => dayjs(item.expiredAt).format("YYYY-MM-DD HH:mm:ss"), [item.expiredAt])
	const reasonText = {
		ttl: "TTL",
		max_messages: "Max msgs",
		disconnect: "Disconnect",
		limit: "Limit"
	}[item.reason] || item.reason

	return <div className={cls.row}>
		<div className={cls.row_sbj}>{item.subject}</div>
		<div style={{ display: "flex" }}>
			<div className={cls.row_counter} style={{ color: "var(--color-yellow)" }}>{reasonText}</div>
			<div style={{ flex: 1 }} />
			<div className={cls.row_time}>{time}</div>
		</div>
	</div>
}
