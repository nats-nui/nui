import Button from "@/components/buttons/Button"
import EditList from "@/components/lists/EditList"
import EditSubscriptionRow from "@/components/rows/EditSubscriptionRow"
import CheckOnIcon from "@/icons/CheckOnIcon"
import cnnSo from "@/stores/connections"
import { MessagesState, MessagesStore } from "@/stores/stacks/connection/messages"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"
import Dialog from "../../dialogs/Dialog"



interface Props {
	store?: MessagesStore
}

const SubjectsDialog: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessagesState

	// HOOKs
	const [subscriptions, setSubscriptions] = useState([])

	useEffect(() => {
		if (!msgSa.subscriptionsOpen) return
		const cnn = cnnSo.getById(msgSa.connectionId)
		const subs = msgSa.subscriptions.map<Subscription>(sub => ({
			...sub,
			favorite: !!cnn.subscriptions.find(s => s.subject == sub.subject)
		}))
		setSubscriptions(subs)

	}, [msgSa.subscriptionsOpen])

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
		console.log(newSubs)
		setSubscriptions(newSubs)
	}

	// RENDER
	return <Dialog
		timeoutClose={-1}
		title={<div style={{ display: "flex", alignItems: "center" }}>
			<CheckOnIcon style={{ marginRight: 5 }} />
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
			onNewItem={() => ({ subject: "" })}
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

