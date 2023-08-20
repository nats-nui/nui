import { ConnectionState, ConnectionStore } from "@/stores/connection"
import { ViewStore } from "@/stores/docs/docBase"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"



interface Props {
	store?: ConnectionStore
	parentSo?: ViewStore
}

const SubscriptionsDialog: FunctionComponent<Props> = ({
	store: cnnSo,
	parentSo,
}) => {

	// STORES
	const cnnSa = useStore(cnnSo) as ConnectionState
	if ( !parentSo ) parentSo = cnnSo

	// HOOKS
	const [select, setSelect] = useState<Subscription>(null)

	// HANDLERS
	const onClickSub = (sub: Subscription) => {
		setSelect(sub)
	}
	const handleChangeSubject = (e: React.ChangeEvent<HTMLInputElement>) => {
		select.subject = e.target.value
		cnnSo.updateSelected({ ...connection })
	}
	const handleDelete = () => {
		const subscriptions = connection.subscriptions.filter(sub => sub != select)
		const cnn = { ...connection, subscriptions }
		cnnSo.updateSelected(cnn)
	}
	const handleNew = () => {
		const newSubscription = { subject: "<new>" }
		connection.subscriptions.push(newSubscription)
		setSelect(newSubscription)
		//const cnn = { ...connection, subscriptions }
		//cnnSo.updateSelected(cnn)
	}
	const handleClose = () => parentSo.setDialogCmp(null)

	// RENDER
	const connection = cnnSo.getSelect()
	if (!connection) return null

	return <div style={{ height: "100%", width: "200px", backgroundColor: "red", paddingLeft: "10px" }}>

		<div onClick={handleClose}>X</div>

		{connection.subscriptions?.map((sub, index) =>
			<div key={index} style={{ backgroundColor: sub==select ? "white" : null}}
				onClick={() => onClickSub(sub)}
			>{sub.subject}</div>
		)}

		{select && <>
			<input
				value={select.subject}
				onChange={handleChangeSubject}
			/>
			<button
				onClick={handleDelete}
			>DELETE</button>
			<button
				onClick={handleNew}
			>NEW</button>

		</>}

	</div>
}

export default SubscriptionsDialog

