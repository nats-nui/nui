import Label from "@/components/input/Label"
import { Source } from "@/types/Stream"
import { FunctionComponent, useCallback, useEffect, useRef, useState } from "react"
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
	// const [inputRef, setInputRef] = useState<HTMLDivElement>(null)
	//const refTest = useRef(null)
	// console.log( refTest.current)
	// useEffect(() => {
	// 	if (!refTest.current) return
	// 	setTimeout(() => refTest.current?.focus(), 100)
	// }, [refTest.current])

	// HANDLER
	const handleNameChange = (name: string) => onChange?.({ ...source, name })
	const handleSequenceChange = (startSequence: string) => onChange?.({ ...source, startSequence: parseInt(startSequence) })
	const handleStartTimeChange = (startTime: any) => onChange?.({ ...source, startTime: startTime })
	const handleFilterSubjectChange = (filterSubject: string) => onChange?.({ ...source, filterSubject })

	const refCllb = useCallback(( node ) => setTimeout(()=>node?.focus(),100),[])
	
	// RENDER
	if (!source) return null

	return <>
		<Label>NAME</Label>
		<TextInput
			ref={refCllb}
			//ref={(node)=>node?.focus()}
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
