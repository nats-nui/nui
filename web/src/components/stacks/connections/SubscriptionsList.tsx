import IconButton from "@/components/buttons/IconButton"
import Label from "@/components/input/Label"
import AddIcon from "@/icons/AddIcon"
import CheckOffIcon from "@/icons/CheckOffIcon"
import CloseIcon from "@/icons/CloseIcon"
import { Subscription } from "@/types"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import layoutSo from "@/stores/layout"
import IconToggle from "@/components/buttons/IconToggle"
import CheckOnIcon from "@/icons/CheckOnIcon"



interface Props {
	subscriptions: Subscription[]
	onChange: (subscriptions: Subscription[]) => void
}

/**
 * dettaglio di una CONNECTION
 */
const SubscriptionsList: FunctionComponent<Props> = ({
	subscriptions,
	onChange,
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
	const handleFocus = (index: number) => setFocus(index)
	const handleDeleteSub = (index: number) => {
		subscriptions.splice(index, 1)
		onChange?.([...subscriptions])
	}
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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
				handleNewSub(focus+1)
				return
		}
		if (newFocus < 0) newFocus = 0
		if (newFocus >= subscriptions.length) newFocus = subscriptions.length - 1
		setFocus(newFocus)
	}

	// RENDER

	return <div
		style={{ display: "flex", flexDirection: "column" }}
		onKeyDown={handleKeyDown}
		onBlur={()=>setFocus(-1)}
	>

		<Label>
			<span>SUBSCRIPTIONS</span>
			<IconButton
				onClick={() => handleNewSub()}
			><AddIcon /></IconButton>
		</Label>

		<div style={cssRoot}>
			{subscriptions.map((sub: Subscription, index: number) => <SubRow
				sub={sub}
				focus={index == focus}
				onChange={(newSub) => handleChangeSub(newSub, index)}
				onFocus={() => handleFocus(index)}
				onDelete={() => handleDeleteSub(index)}
			/>)}
		</div>
	</div>
}

export default SubscriptionsList

const cssRoot: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	backgroundColor: layoutSo.state.theme.palette.bg.default,
	color: layoutSo.state.theme.palette.fg.default,
	padding: 5,
	marginLeft: -7,
}
interface SubRowProps {
	sub: Subscription
	focus?: boolean
	onChange?: (sub: Subscription) => void
	onFocus?: () => void
	onDelete?: () => void
}

const SubRow: FunctionComponent<SubRowProps> = ({
	sub,
	focus,
	onChange,
	onFocus,
	onDelete,
}) => {

	// HOOKS
	const [enter, setEnter] = useState(false)
	const inputRef = useRef(null);
	useEffect(() => {
		if (focus) inputRef.current?.select()
	}, [focus, inputRef.current])

	// HANDLER
	const handleChangeSubject = (e) => {
		const newSub: Subscription = { ...sub, subject: e.target.value }
		onChange?.(newSub)
	}
	const handleEnter = () => setEnter(true)
	const handleLeave = () => setEnter(false)
	const handleFocus = () => onFocus?.()
	const handleDelete = () => onDelete?.()
	const handleChangeEnabled = (enabled) => {
		const newSub: Subscription = { ...sub, disabled: !enabled }
		onChange?.(newSub)
	}

	// RENDER
	const selVisible = enter// || focus
	return <div
		style={{ ...cssRow, opacity: sub.disabled ? 0.5 : 1 }}
		onMouseEnter={handleEnter}
		onMouseLeave={handleLeave}
		onFocus={handleFocus}
	>
		<IconToggle
			//style={{ visibility: selVisible ? "visible" : "hidden" }}
			check={!sub.disabled}
			onChange={handleChangeEnabled}
			trueIcon={<CheckOnIcon />}
			falseIcon={<CheckOffIcon />}
		/>

		<input style={cssInput}
			type="text"
			ref={inputRef}
			value={sub.subject}
			onChange={handleChangeSubject}
		/>

		{selVisible && (
			<IconButton
				onClick={handleDelete}
			><CloseIcon /></IconButton>
		)}
	</div>
}

const cssRow: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
}

const cssInput: React.CSSProperties = {
	minWidth: 50,
	backgroundColor: 'transparent',
	border: 'none',
	color: "currentcolor",
}