import { Source, SubjectTransform } from "@/types/Stream"
import { NumberInput, TextInput, Options, IconToggle, TooltipWrapCmp, DateTimeInput, EditList } from "@priolo/jack"
import { FunctionComponent, useEffect, useState } from "react"
import dayjs from "dayjs";
import EditSubjectTransformRow from "../../../../rows/EditSubjectTransformRow";


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

	//chose if render sources select dialog or external source dialog
	const [isExternal, setIsExternal] = useState<boolean>(false)
	const [optStartTime, setOptStartTime] = useState<string>("")
	useEffect(() => {
		setIsExternal(source?.external != null)
		setOptStartTime(source?.optStartTime ? dayjs(source.optStartTime).format("YYYY-MM-DD HH:mm:ss") : "")
	}, [source.name]);
	// HANDLER
	const handleNameChange = (name: string) => onChange?.({ ...source, name })
	const handleSequenceChange = (optStartSeq: number) => onChange?.({ ...source, optStartSeq })
	const handleStartTimeChange = (startTime: any) => {
		setOptStartTime(startTime)
		const time = dayjs(startTime)
		const isoTime = time.isValid() ? time.toISOString() : null
		onChange?.({ ...source, optStartTime: isoTime })
	}
	const handleFilterSubjectChange = (filterSubject: string) => onChange?.({ ...source, filterSubject })

	const handleIsExternalChange = (check: boolean) => {
		source.external = null
		if (check) {
			source.external = { api: "", deliver: "" }
		}
		handleNameChange("")
		setIsExternal(source?.external != null)
	}

	const handleExternalApiChange = (api: string) => onChange?.({ ...source, external: { ...source.external, api } })
	const handleExternalDeliverChange = (deliver: string) => onChange?.({ ...source, external: { ...source.external, deliver } })

	const handleSubjectTransformsChange = (subjectTransforms: SubjectTransform[]) => {
		onChange?.({ ...source, subjectTransforms })
	}

	// RENDER
	if (!source) return null
	const timeRender = source.optStartTime ? dayjs(source.optStartTime).format("YYYY-MM-DD HH:mm:ss") : ""
	const haveListStream = allStream && allStream.length > 0

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
			{!isExternal && haveListStream
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
			<div className="jack-lbl-prop">START TIME</div>
			<DateTimeInput
				style={{ flex: 1 }}
				value={optStartTime}
				onChange={handleStartTimeChange}
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

		<div className="lyt-v">
			<div className="jack-lbl-prop">SUBJECT TRANSFORMS</div>
			<EditList<SubjectTransform>
				style={{ marginTop: 5 }}
				items={source.subjectTransforms}
				onItemsChange={handleSubjectTransformsChange}
				placeholder="eg. orders.* or telemetry.>"
				readOnly={readOnly}
				onNewItem={() => ({ src: "", dest: "" })}
				fnIsVoid={i => !(i?.src.trim().length > 0) || !(i?.dest.trim().length > 0)}
				RenderRow={EditSubjectTransformRow}
			/>
		</div>

	</div>
}

export default EditSourceCmp
