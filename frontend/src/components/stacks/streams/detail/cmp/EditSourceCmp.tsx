import { Source } from "@/types/Stream"
import {NumberInput, TextInput, Options, IconToggle, TooltipWrapCmp} from "@priolo/jack"
import {FunctionComponent, useEffect, useState} from "react"



interface Props {
	source: Source
	external?: boolean
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

	//chose if render sources select dialog or external source dialog
	const [isExternal, setIsExternal] = useState<boolean>(false)
	useEffect(() => {
		setIsExternal(source?.external != null)
	}, []);
	// HANDLER
	const handleNameChange = (name: string) => onChange?.({ ...source, name })
	const handleSequenceChange = (optStartSeq: number) => onChange?.({ ...source, optStartSeq })
	//const handleStartTimeChange = (startTime: any) => onChange?.({ ...source, startTime: startTime })
	const handleFilterSubjectChange = (filterSubject: string) => onChange?.({ ...source, filterSubject })

	const handleIsExternalChange = (check: boolean) => {
		source.external = null
        if (check) {
			source.external = {api: "", deliver: ""}
		}
		handleNameChange("")
        setIsExternal(source?.external != null)
	}

    const handleExternalApiChange = (api: string) => onChange?.({ ...source, external: { ...source.external, api } })
    const handleExternalDeliverChange = (deliver: string) => onChange?.({ ...source, external: { ...source.external, deliver } })

	// RENDER
	if (!source) return null

	return <div className="jack-lyt-form var-dialog">
		<div className="lyt-v">
			<div className="jack-cmp-h lbl-info-container">
				<IconToggle
					check={isExternal}
					onChange={handleIsExternalChange}
					readOnly={readOnly}
				/>
				<div className="jack-lbl-prop">EXTERNAL</div>
				<TooltipWrapCmp className="lbl-info" children="?"
								content="Source from external JS API (different account or domain)"
				/>
			</div>
		</div>
		<div className="lyt-v">
			<div className="jack-lbl-prop">NAME</div>
			{!isExternal
				? <Options<string> height={500}
								   value={source.name}
								   items={allStream}
								   readOnly={readOnly}
								   onSelect={handleNameChange}
				/>

				: <TextInput
					value={source.name}
					onChange={handleNameChange}
					readOnly={readOnly}
				/>
			}

		</div>

		{isExternal && <div className="lyt-v">
			<div className="jack-lbl-prop">JS API</div>
			<TextInput
				value={source.external.api}
				onChange={handleExternalApiChange}
				readOnly={readOnly}
			/>
		</div>}

		{isExternal && <div className="lyt-v">
			<div className="jack-lbl-prop">DELIVER SUBJECT</div>
			<TextInput
				value={source.external.deliver}
				onChange={handleExternalDeliverChange}
				readOnly={readOnly}
			/>
		</div>}

		<div className="lyt-v">
			<div className="jack-lbl-prop">START SEQUENCE</div>
			<NumberInput
				value={source.optStartSeq}
				onChange={handleSequenceChange}
				readOnly={readOnly}
			/>
		</div>

		<div className="lyt-v">
			<div className="jack-lbl-prop">FILTER SUBJECTS</div>
			<TextInput
				value={source.filterSubject}
				onChange={handleFilterSubjectChange}
				readOnly={readOnly}
			/>
		</div>
	</div>
}

export default EditSourceCmp
