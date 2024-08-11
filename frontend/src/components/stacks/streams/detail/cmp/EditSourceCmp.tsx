import { Source } from "@/types/Stream"
import { NumberInput, TextInput, Options } from "@priolo/jack"
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

	// HANDLER
	const handleNameChange = (name: string) => onChange?.({ ...source, name })
	const handleSequenceChange = (optStartSeq: number) => onChange?.({ ...source, optStartSeq })
	//const handleStartTimeChange = (startTime: any) => onChange?.({ ...source, startTime: startTime })
	const handleFilterSubjectChange = (filterSubject: string) => onChange?.({ ...source, filterSubject })

	// RENDER
	if (!source) return null

	return <div className="jack-lyt-form var-dialog">
		<div className="lyt-v">
			<div className="jack-lbl-prop">NAME</div>
			<Options<string> height={500}
				value={source.name}
				items={allStream}
				readOnly={readOnly}
				onSelect={handleNameChange}
			/>
		</div>
		<div className="lyt-v">
			<div className="jack-lbl-prop">START SEQUENCE</div>
			<NumberInput
				value={source.optStartSeq}
				onChange={handleSequenceChange}
				readOnly={readOnly}
			/>
		</div>
		<div className="lyt-v">
			<div className="jack-lbl-prop">FILTER SUBJECT</div>
			<TextInput
				value={source.filterSubject}
				onChange={handleFilterSubjectChange}
				readOnly={readOnly}
			/>
		</div>
	</div>
}

export default EditSourceCmp
