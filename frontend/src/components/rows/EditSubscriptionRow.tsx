import CloseIcon from "@/icons/CloseIcon"
import HeartIcon from "@/icons/HeartIcon"
import HeartOutlineIcon from "@/icons/HeartOutlineIcon"
import { Subscription } from "@/types"
import { FunctionComponent } from "react"
import cls from "./EditSubscriptionRow.module.css"
import { Box, IconButton, IconToggle, TextInput } from "@priolo/jack"
import { RenderRowBaseProps } from "@priolo/jack"



interface Props extends RenderRowBaseProps<Subscription> {
	noDisable?: boolean
	noFavorite?: boolean
}

const EditSubscriptionRow: FunctionComponent<Props> = ({
	item,
	isSelect,
	readOnly = false,
	noDisable,
	noFavorite,
	placeholder,
	onChange,
	onSelect,
}) => {

	// HOOKS

	// HANDLER
	const handleDelete = () => onChange?.(null)
	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if ((event.key == "Delete" || event.key == "Backspace") && isVoid(item)) {
			event.preventDefault()
			onChange?.(null)
		}
	}
	const handleChange = (subject: string) => onChange?.({ ...item, subject })
	const handleChangeEnabled = (enabled: boolean) => {
		const newSub: Subscription = { ...item, disabled: !enabled }
		onChange?.(newSub)
	}
	const handleChangeFavorite = (enabled: boolean) => {
		const newSub: Subscription = { ...item, favorite: enabled }
		onChange?.(newSub)
	}

	// RENDER
	const value = item.subject
	const clsInput = `${cls.input} ${!noDisable && item.disabled ? cls.disabled : ""}`

	return <Box className={cls.root}
		readOnly={readOnly}
	>
		{!noDisable && (
			<IconToggle
				//style={{ marginTop: '5px' }}
				check={!item.disabled}
				onChange={handleChangeEnabled}
				readOnly={readOnly}
			/>
		)}
		{!noFavorite && (
			<IconToggle
				//style={{ marginTop: '5px' }}
				check={item.favorite}
				onChange={handleChangeFavorite}
				readOnly={readOnly}
				trueIcon={<HeartIcon style={{ width: 16, height: 16 }} />}
				falseIcon={<HeartOutlineIcon style={{ width: 16, height: 16 }} />}
			/>
		)}
		<TextInput multiline
			className={clsInput}
			value={value}
			placeholder={placeholder}
			focus={isSelect}
			readOnly={readOnly}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={onSelect}
		/>
		{!readOnly && (
			<IconButton
				style={{ marginLeft: 4, opacity: 0.7 }}
				onClick={handleDelete}
			>
				<CloseIcon style={{ width: 14, height: 14 }} />
			</IconButton>
		)}
	</Box>
}

export default EditSubscriptionRow

const isVoid = (item: Subscription) => !item?.subject || item.subject?.trim().length == 0

export const EditSubscriptionNoDisableRow: FunctionComponent<Props> = (props) => <EditSubscriptionRow {...props} noDisable noFavorite />