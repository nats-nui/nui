import Label from "@/components/input/Label"
import { Source } from "@/types/Stream"
import { FunctionComponent } from "react"
import DateTimeInput from "../../input/DateTimeInput"
import NumberInput from "../../input/NumberInput"
import TextInput from "../../input/TextInput"

interface Props {
	source: Source
	readOnly?: boolean
	onChange: (source: Source) => void
}

const EditSourceCmp: FunctionComponent<Props> = ({
	source,
	readOnly,
	onChange,
}) => {

	// HOOKS

	// HANDLER
	const handleNameChange = (name: string) => onChange?.({ ...source, name })
	const handleSequenceChange = (startSequence: string) => onChange?.({ ...source, startSequence: parseInt(startSequence) })
	const handleStartTimeChange = (startTime: any) => onChange?.({ ...source, startTime: startTime })
	const handleFilterSubjectChange = (filterSubject: string) => onChange?.({ ...source, filterSubject })

	// RENDER
	if (!source) return null

	return <>
		<Label>NAME</Label>
		<TextInput
			style={{ flex: 1 }}
			value={source.name}
			onChange={handleNameChange}
			//onFocus={onFocus}
			//variant={variant}
			readOnly={readOnly}
		/>
		<Label>START SEQUENCE</Label>
		<NumberInput
			value={source.startSequence}
			onChange={handleSequenceChange}
			// variant={variant}
			readOnly={readOnly}
		/>
		<Label>START TIME</Label>
		<DateTimeInput
			value={source.startTime}
			onChange={handleStartTimeChange}
			// variant={variant}
			readOnly={readOnly}
		/>
		<Label>FILTER SUBJECT</Label>
		<TextInput
			value={source.filterSubject}
			onChange={handleFilterSubjectChange}
			// variant={variant}
			readOnly={readOnly}
		/>
	</>
}

export default EditSourceCmp
