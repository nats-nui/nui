import MaxTimeCmp from "@/components/input/MaxTimeCmp"
import CloseIcon from "@/icons/CloseIcon"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { TIME } from "@/utils/conversion"
import { EditList, IconButton } from "@priolo/jack"
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

	// RENDER
	return <>
		<div className={readOnly ? "jack-lyt-quote" : undefined}>
			<EditList<number>
				items={backoff}
				onItemsChange={onChange}
				onNewItem={() => 0}
				readOnly={readOnly}
				RenderRow={({ item, readOnly, index, onChange }) => (
					<div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
						{!readOnly && (
							<IconButton effect onClick={() => onChange(null)}>
								<CloseIcon />
							</IconButton>
						)}
						<MaxTimeCmp 
							autoFocus
							store={store}
							value={item}
							onChange={onChange}
							readOnly={readOnly}
							inputUnit={TIME.NS}
						/>
					</div>
				)}
			/>
		</div>

		{(!backoff || backoff.length === 0) && (
			<div className="jack-lbl-empty">NO BACKOFF</div>
		)}
	</>
}

export default BackoffCmp