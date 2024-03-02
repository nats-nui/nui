import Options from "@/components/Options"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import NumberInput from "@/components/input/NumberInput"
import TextInput from "@/components/input/TextInput"
import { Source } from "@/types/Stream"
import { FunctionComponent } from "react"



interface Props {
	source: Source
	readOnly?: boolean
	allStream?: string[]
	onChange: (source: Source) => void
}

const EditSourceCmp: FunctionComponent<Props> = ({
	source,
	readOnly,
	allStream,
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
	const handleSequenceChange = (startSequence: string) => onChange?.({ ...source, optStartSeq: parseInt(startSequence) })
	//const handleStartTimeChange = (startTime: any) => onChange?.({ ...source, startTime: startTime })
	const handleFilterSubjectChange = (filterSubject: string) => onChange?.({ ...source, filterSubject })

	//const refCllb = useCallback(( node ) => setTimeout(()=>node?.focus(),100),[])

	// RENDER
	if (!source) return null

	return <Form>
		<BoxV>
			<Label>NAME</Label>
			<Options<string> height={500}
				value={source.name}
				items={allStream}
				RenderRow={({ item }) => item}
				readOnly={readOnly}
				onSelect={handleNameChange}
			/>
		</BoxV>
		{/* <TextInput
			//ref={refCllb}
			focus
			//ref={(node)=>node?.focus()}
			style={{ flex: 1 }}
			value={source.name}
			onChange={handleNameChange}
			//onFocus={onFocus}
			//variant={variant}
			readOnly={readOnly}
		/> */}
		<BoxV>
			<Label>START SEQUENCE</Label>
			<NumberInput
				value={source.optStartSeq}
				onChange={handleSequenceChange}
				// variant={variant}
				readOnly={readOnly}
			/>
		</BoxV>
		{/* <Label>START TIME</Label>
		<DateTimeInput
			value={source.startTime}
			onChange={handleStartTimeChange}
			// variant={variant}
			readOnly={readOnly}
		/> */}
		<BoxV>
			<Label>FILTER SUBJECT</Label>
			<TextInput
				value={source.filterSubject}
				onChange={handleFilterSubjectChange}
				// variant={variant}
				readOnly={readOnly}
			/>
		</BoxV>
	</Form>
}

export default EditSourceCmp
