// import IconButton from "@/components/buttons/IconButton"
// import Label from "@/components/input/Label"
// import CloseIcon from "@/icons/CloseIcon"
// import layoutSo from "@/stores/layout"
// import { Source } from "@/types/Stream"
// import { FunctionComponent, useEffect, useState } from "react"
// import Accordion from "../Accordion"
// import DateTimeInput from "../input/DateTimeInput"
// import NumberInput from "../input/NumberInput"
// import TextInput from "../input/TextInput"
// import { RenderRowBaseProps } from "../lists/EditList"



// const EditSourceRow: FunctionComponent<RenderRowBaseProps<Source>> = ({
// 	item,
// 	isSelect: focus,
// 	variant,
// 	readOnly,
// 	onChange,
// 	onDelete,
// 	onSelect: onFocus,
// }) => {

// 	// useEffect(() => {
// 	// 	// SET FOCUS
// 	// }, [focus])

// 	useEffect(() => {
// 		if (!!item) return
// 		onChange({
// 			name: "",
// 			startSequence: 0,
// 			startTime: null,
// 			filterSubject: ""
// 		})
// 	}, [item])

// 	// HOOKS

// 	// ******************
// 	const [enter, setEnter] = useState(false)

// 	const handleEnter = () => setEnter(true)
// 	const handleLeave = () => setEnter(false)

// 	// HANDLER

// 	// ******************
// 	const handleDelete = (e: React.MouseEvent<Element, MouseEvent>) => {
// 		e.preventDefault()
// 		e.stopPropagation()
// 		onDelete?.()
// 	}


// 	const handleNameChange = (name: string) => onChange?.({ ...item, name })
// 	const handleSequenceChange = (startSequence: string) => onChange?.({ ...item, startSequence: parseInt(startSequence) })
// 	const handleStartTimeChange = (startTime: any) => onChange?.({ ...item, startTime: startTime })
// 	const handleFilterSubjectChange = (filterSubject: string) => onChange?.({ ...item, filterSubject })
// 	const handleLabelClick = () => {
// 		// if (readOnly && focus) {
// 		// }
// 		onFocus?.()
// 	}

// 	// RENDER
// 	if (!item) return null
// 	const delVisible = enter && !readOnly

// 	return <div
// 		style={cssRow(focus, variant)}
// 		onMouseEnter={handleEnter}
// 		onMouseLeave={handleLeave}
// 		onClick={handleLabelClick}
// 	>
// 		<div style={{ display: "flex", cursor: readOnly ? "pointer" : null }}>
// 			<TextInput
// 				style={{ flex: 1 }}
// 				focus={focus}
// 				value={item.name}
// 				onChange={handleNameChange}
// 				//onFocus={onFocus}
// 				variant={variant}
// 				readOnly={readOnly}
// 			/>
// 			{delVisible && (
// 				<IconButton
// 					onClick={handleDelete}
// 				><CloseIcon /></IconButton>
// 			)}
// 		</div>
// 		<Accordion open={focus}>
// 			<Label>START SEQUENCE:</Label>
// 			<NumberInput
// 				value={item.startSequence}
// 				onChange={handleSequenceChange}
// 				variant={variant}
// 				readOnly={readOnly}
// 			/>
// 			<Label>START TIME:</Label>
// 			<DateTimeInput
// 				value={item.startTime}
// 				onChange={handleStartTimeChange}
// 				variant={variant}
// 				readOnly={readOnly}
// 			/>
// 			<Label>FILTER SUBJECT:</Label>
// 			<TextInput
// 				value={item.filterSubject}
// 				onChange={handleFilterSubjectChange}
// 				variant={variant}
// 				readOnly={readOnly}
// 			/>
// 		</Accordion>

// 	</div>
// }

// export default EditSourceRow

// const cssRow = (focus: boolean, variant: number): React.CSSProperties => ({
// 	display: "flex",
// 	padding: 3,
// 	margin: 3,
// 	flexDirection: "column",
// 	borderRadius: 3,
// 	...focus && {
// 		backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
// 		color: layoutSo.state.theme.palette.var[variant].fg,
// 	}
// })