import { CnnViewState, CnnViewStore } from "@/stores/stacks/connection"
import { ViewStore } from "@/stores/docs/docBase"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import cnnSo from "@/stores/connections"



interface Props {
	store?: CnnViewStore
	parentSo?: ViewStore
}

const SubscriptionsDlg: FunctionComponent<Props> = ({
	store: viewSo,
	parentSo,
}) => {

	// STORES
	const viewSa = useStore(viewSo) as CnnViewState
	if (!parentSo) parentSo = viewSo

	// HOOKS
	const [select, setSelect] = useState<Subscription>(null)

	// HANDLERS
	const onClickSub = (sub: Subscription) => {
		setSelect(sub)
	}
	const handleChangeSubject = (e: React.ChangeEvent<HTMLInputElement>) => {
		select.subject = e.target.value
		cnnSo.updateConnection({ ...connection })
	}
	const handleDelete = () => {
		const subscriptions = connection.subscriptions.filter(sub => sub != select)
		const cnn = { ...connection, subscriptions }
		cnnSo.updateConnection(cnn)
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
	const connection = cnnSo.getById(viewSo.getSelectId())
	if (!connection) return null

	return <div style={cssContainer}>

		<div onClick={handleClose}>X</div>

		{connection.subscriptions?.map((sub, index) =>
			<div key={index} style={{ backgroundColor: sub == select ? "white" : null }}
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
		</>}

		<button
			onClick={handleNew}
		>NEW</button>


	</div>
}

export default SubscriptionsDlg

const cssContainer: React.CSSProperties = {
	paddingLeft: "15px",
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: "#a0e312",
	color: "black",
	width: "146px",
}

// { height: "100%", width: "200px", backgroundColor: "red", paddingLeft: "10px" }