import Button from "@/components/buttons/Button"
import IconToggle from "@/components/buttons/IconToggle"
import EditList from "@/components/lists/EditList"
import EditSubscriptionRow from "@/components/rows/EditSubscriptionRow"
import cnnSo from "@/stores/connections"
import { MessagesState, MessagesStore } from "@/stores/stacks/connection/messages"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import Dialog from "../../../dialogs/Dialog"



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

	// RENDER
	const allCheck = useMemo(() => subscriptions.every(s => !s.disabled), [subscriptions])

	return <Dialog
		timeoutClose={-1}
		title={<div style={{ display: "flex", alignItems: "center" }}>
			<IconToggle style={{ marginTop: 3, marginRight: 6 }}
				check={allCheck}
				onChange={handleAllDisable}
			/>
			SUBJECTS
		</div>}
		width={200}
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
		<div className="var-dialog" style={{ display: "flex", gap: 15, marginTop: 10 }} >
			<Button children="CANCEL" onClick={handleCancel} />
			<Button children="OK" onClick={handleOk} />
		</div>
	</Dialog>
}

export default SubjectsDialog

