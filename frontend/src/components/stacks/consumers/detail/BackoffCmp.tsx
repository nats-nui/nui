import MaxTimeCmp from "@/components/input/MaxTimeCmp"
import AddIcon from "@/icons/AddIcon"
import CloseIcon from "@/icons/CloseIcon"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { TIME } from "@/utils/conversion"
import { IconButton } from "@priolo/jack"
import { FunctionComponent } from "react"



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
	const handleBackoffChange = (newBackoff: number[]) => {
		onChange(newBackoff)
	}

	// RENDER
	return <>

		<div
			style={{ display: "flex", flexDirection: "column", gap: 5 }}
			className={readOnly ? "jack-lyt-quote" : null}
		>
			{backoff?.map((backoffValue, index) => (
				<div style={{ display: "flex", alignItems: "center", gap: "3px" }} key={index}>

					{!readOnly && (
						<IconButton effect
							onClick={() => {
								const newBackoff = [...backoff]
								newBackoff.splice(index, 1)
								handleBackoffChange(newBackoff)
							}}
						><CloseIcon /></IconButton>
					)}

					<MaxTimeCmp autoFocus
						store={store}
						value={backoffValue}
						onChange={value => {
							const newBackoff = [...backoff]
							newBackoff[index] = value
							handleBackoffChange(newBackoff)
						}}
						readOnly={readOnly}
						inputUnit={TIME.NS}
					/>

				</div>
			))}
		</div>

		{(!backoff || backoff.length == 0) && (
			<div className="jack-lbl-empty">NO BACKOFF</div>
		)}

		{!readOnly && (
			<IconButton effect
				onClick={() => {
					const newBackoff = [...(backoff ?? []), 0]
					handleBackoffChange(newBackoff)
				}} style={{ marginTop: 5 }}
			><AddIcon /></IconButton>
		)}
	</>
}

export default BackoffCmp
