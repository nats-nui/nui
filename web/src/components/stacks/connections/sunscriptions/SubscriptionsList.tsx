import IconButton from "@/components/buttons/IconButton"
import AddIcon from "@/icons/AddIcon"
import { Subscription } from "@/types"
import { FunctionComponent, useState } from "react"
import SubscriptionRow from "./SubscriptionRow"



interface Props {
	subscriptions: Subscription[]
	noDelete?: boolean
	noDisable?: boolean
	onChange: (subscriptions: Subscription[]) => void
	style?: React.CSSProperties
}

/**
 * dettaglio di una CONNECTION
 */
const SubscriptionsList: FunctionComponent<Props> = ({
	subscriptions,
	noDelete,
	noDisable,
	onChange,
	style,
}) => {

	// STORE
	const [focus, setFocus] = useState(-1)

	// HOOKs

	// HANDLER
	const handleChangeSub = (newSub: Subscription, index: number) => {
		subscriptions[index] = newSub
		onChange?.([...subscriptions])
	}
	const handleNewSub = (index?: number) => {
		const newSub: Subscription = { subject: "<new>" }
		if (index == null) index = subscriptions.length
		subscriptions.splice(index, 0, newSub)
		onChange?.([...subscriptions])
		setFocus(index)
	}
	const handleFocus = (index: number) => {
		setFocus(index)
	}
	const handleDeleteSub = (index: number) => {
		subscriptions.splice(index, 1)
		onChange?.([...subscriptions])
	}
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		console.log(event.key)
		if (focus == -1) return
		let newFocus = focus
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault()
				newFocus--
				break
			case 'ArrowDown':
				event.preventDefault()
				newFocus++
				break
			case "Enter":
				event.preventDefault()
				handleNewSub(focus + 1)
				return
			case "Delete":
			case "Backspace":
				if (subscriptions[focus]?.subject?.length > 0) return
				event.preventDefault()
				handleDeleteSub(focus)
		}
		if (newFocus < 0) newFocus = 0
		if (newFocus >= subscriptions.length) newFocus = subscriptions.length - 1
		setFocus(newFocus)
	}

	// RENDER

	return <div
		style={{ ...cssList, ...style }}
		onKeyDown={handleKeyDown}
		onBlur={() => setFocus(-1)}
	>
		{subscriptions.map((sub: Subscription, index: number) => <SubscriptionRow key={index}
			sub={sub}
			focus={index == focus}
			onChange={(newSub) => handleChangeSub(newSub, index)}
			onFocus={() => handleFocus(index)}
			onDelete={() => handleDeleteSub(index)}
			noDelete={noDelete}
			noDisable={noDisable}
		/>)}
		<IconButton
			onClick={() => handleNewSub()}
		><AddIcon /></IconButton>
	</div>
}

export default SubscriptionsList


const cssList: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	padding: 5,
}
