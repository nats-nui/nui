import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"



interface Props {
	parentSo: CnnDetailStore
	onClose?: () => void
}

const SubscriptionsDlg: FunctionComponent<Props> = ({
	parentSo,
	onClose,
}) => {

	// STORES
	const cnnDetailSa = useStore(parentSo) as CnnDetailState

	// HOOKS
	const [select, setSelect] = useState<number>(null)

	// HANDLERS
	const onClickSub = (index: number) => {
		setSelect(index)
	}
	const handleChangeSubject = (e: React.ChangeEvent<HTMLInputElement>) => {
		cnnDetailSa.connection.subscriptions[select].subject = e.target.value
		parentSo.setConnection({ ...cnnDetailSa.connection })
	}
	const handleDelete = () => {
		cnnDetailSa.connection.subscriptions.splice(select, 1)
		parentSo.setConnection({ ...cnnDetailSa.connection })
	}
	const handleNew = () => {
		const newSubscription = { subject: "<new>" }
		cnnDetailSa.connection.subscriptions.push(newSubscription)
		parentSo.setConnection({ ...cnnDetailSa.connection })
	}
	const handleClose = () => onClose()

	// RENDER
	if (!cnnDetailSa.connection) return null

	return <div style={cssContainer}>

		<div onClick={handleClose}>X</div>

		{cnnDetailSa.connection.subscriptions?.map((sub, index) =>
			<div key={index} style={{ backgroundColor: index == select ? "red" : null }}
				onClick={() => onClickSub(index)}
			>{sub.subject}</div>
		)}

		{select != null && <>
			<input
				value={cnnDetailSa.connection.subscriptions[select]?.subject ?? ""}
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