import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { RenderRowBaseProps } from "../lists/EditList"
import { AUTH_MODE, Auth } from "@/types"
import Button from "@/components/buttons/Button"
import Label from "@/components/input/Label"
import { Source } from "@/types/Stream"
import TextInput from "../input/TextInput"
import Accordion from "../Accordion"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import NumberInput from "../input/NumberInput"
import DateTimeInput from "../input/DateTimeInput"



const EditSourceRow: FunctionComponent<RenderRowBaseProps<Source>> = ({
	item,
	focus,
	readOnly,
	onChange,
	onDelete,
	onFocus,
}) => {

	useEffect(() => {
		// SET FOCUS
	}, [focus])

	useEffect(() => {
		if (!!item) return
		onChange({
			name: "",
			startSequence: 0,
			startTime: "",
			filterSubject: ""
		})
	}, [item])

	// HOOKS

	// ******************
	const [enter, setEnter] = useState(false)

	const handleEnter = () => setEnter(true)
	const handleLeave = () => setEnter(false)

	// HANDLER

	// ******************
	const handleDelete = (e:React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
		onDelete?.()
	}


	const handleNameChange = (name: string) => onChange?.({ ...item, name })
	const handleSequenceChange = (startSequence: string) => onChange?.({ ...item, startSequence: parseInt(startSequence) })
	const handleStartTimeChange = (startTime: string) => onChange?.({ ...item, startTime: startTime })
	const handleFilterSubjectChange = (filterSubject: string) => onChange?.({ ...item, filterSubject })

	// RENDER
	if (!item) return null
	const delVisible = enter

	return <div
		style={cssRow}
		onMouseEnter={handleEnter}
		onMouseLeave={handleLeave}
	>
		<div style={{ display: "flex" }}>
			<TextInput
				focus={focus}
				value={item.name}
				onChange={handleNameChange}
				onFocus={onFocus}
			/>
			{delVisible && (
				<IconButton
					onClick={handleDelete}
				><CloseIcon /></IconButton>
			)}
		</div>
		<Accordion open={focus}>
			<Label>START SEQUENCE:</Label>
			{/* CREATE NUMBERINPUT */}
			<NumberInput
				value={item.startSequence}
				onChange={handleSequenceChange}
			/>
			<Label>START TIME:</Label>
			<DateTimeInput
				value={item.startTime}
				onChange={handleStartTimeChange}
			/>
			<Label>FILTER SUBJECT:</Label>
			<TextInput
				value={item.filterSubject}
				onChange={handleFilterSubjectChange}
			/>
		</Accordion>

	</div>
}

export default EditSourceRow

const isVoid = (item: Auth) => !item || (item.mode == AUTH_MODE.CREDS_FILE && !(item.creds?.length > 0))

const cssRow: React.CSSProperties = {
	display: "flex",
	padding: 3,
	margin: 3,
	flexDirection: "column",
	backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,
	color: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].fg,
	borderRadius: 3,
}
