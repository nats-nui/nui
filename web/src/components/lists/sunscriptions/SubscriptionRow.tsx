import IconButton from "@/components/buttons/IconButton"
import IconToggle from "@/components/buttons/IconToggle"
import CheckOffIcon from "@/icons/CheckOffIcon"
import CheckOnIcon from "@/icons/CheckOnIcon"
import CloseIcon from "@/icons/CloseIcon"
import { Subscription } from "@/types"
import { FunctionComponent, useEffect, useRef, useState } from "react"


interface Props {
	sub: Subscription
	focus?: boolean
	onChange?: (sub: Subscription) => void
	onFocus?: () => void
	onDelete?: () => void

	noDelete?: boolean
	noDisable?: boolean
}

const SubscriptionRow: FunctionComponent<Props> = ({
	sub,
	focus,
	onChange,
	onFocus,
	onDelete,
	noDelete,
	noDisable,
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
	const delVisible = enter && !noDelete

	return <div
		style={{ ...cssRow, opacity: sub.disabled ? 0.5 : 1 }}
		onMouseEnter={handleEnter}
		onMouseLeave={handleLeave}
		onFocus={handleFocus}
	>
		{!noDisable && (
			<IconToggle
				check={!sub.disabled}
				onChange={handleChangeEnabled}
				trueIcon={<CheckOnIcon />}
				falseIcon={<CheckOffIcon />}
			/>
		)}

		<input style={cssInput}
			type="text"
			ref={inputRef}
			value={sub.subject}
			onChange={handleChangeSubject}
		/>

		{delVisible && (
			<IconButton
				onClick={handleDelete}
			><CloseIcon /></IconButton>
		)}
	</div>
}

export default SubscriptionRow

const cssRow: React.CSSProperties = {
	minHeight: 24,
	display: "flex",
	alignItems: "center",
}

const cssInput: React.CSSProperties = {
	minWidth: 50,
	backgroundColor: 'transparent',
	border: 'none',
	color: "currentcolor",

	fontSize: 14,
	fontWeight: 600,
}