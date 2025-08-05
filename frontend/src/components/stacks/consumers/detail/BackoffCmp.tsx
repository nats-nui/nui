import MaxTimeCmp from "@/components/input/MaxTimeCmp"
import AddIcon from "@/icons/AddIcon"
import CloseIcon from "@/icons/CloseIcon"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { TIME } from "@/utils/conversion"
import { IconButton } from "@priolo/jack"
import { FunctionComponent, useState } from "react"



interface Props {
	store?: ConsumerStore
	backoff?: number[]
	onChange: (backoff: number[]) => void
	readOnly?: boolean
}

const BackoffCmp: FunctionComponent<Props> = ({
	store,
	backoff,
	onChange,
	readOnly = false,
}) => {

	// HANDLER
	const handleBackoffChange = (values: any[]) => {
		onChange(values.map(n => n.value))
		setValuesId(values)
	}
	const [valuesId, setValuesId] = useState<any[]>(backoff?.map(n => ({ value: n, id: InstaceCount++ })) ?? [])
	

	// RENDER
	return <>

		<div
			style={{ display: "flex", flexDirection: "column", gap: 5 }}
			className={readOnly ? "jack-lyt-quote" : null}
		>
			{valuesId?.map((v, index) => (
				<div style={{ display: "flex", alignItems: "center", gap: "3px" }} key={v.id}>

					{!readOnly && (
						<IconButton effect
							onClick={() => {
								const newBackoff = [...valuesId]
								newBackoff.splice(index, 1)
								handleBackoffChange(newBackoff)
							}}
						><CloseIcon /></IconButton>
					)}

					<MaxTimeCmp autoFocus
						store={store}
						value={v.value}
						onChange={value => {
							const newBackoff = [...valuesId]
							newBackoff[index].value = value
							handleBackoffChange(newBackoff)
						}}
						readOnly={readOnly}
						inputUnit={TIME.NS}
					/>

				</div>
			))}
		</div>

		{(!valuesId || valuesId.length == 0) && (
			<div className="jack-lbl-empty">NO BACKOFF</div>
		)}

		{!readOnly && (
			<IconButton effect
				onClick={() => {
					const newBackoff = [...(valuesId ?? []), { value: 0, id: InstaceCount++ }]
					handleBackoffChange(newBackoff)
				}} style={{ marginTop: 5 }}
			><AddIcon /></IconButton>
		)}
	</>
}

export default BackoffCmp

let InstaceCount = 0