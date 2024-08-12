import { Accordion, IconToggle, NumberInput } from "@priolo/jack"
import { FunctionComponent } from "react"



interface Props {
	value: number
	label?: string
	readOnly?: boolean
	desiredDefault?: number
	/** value on open */
	initDefault?: number
	min?: number
	max?: number
	onChange?: (valueNew: number) => void
}

const MaxNumberCmp: FunctionComponent<Props> = ({
	value,
	label,
	readOnly,
	min,
	max,
	onChange,
	desiredDefault = -1,
	initDefault = 0,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handlePropChange = (maxConsumers: number) => onChange?.(maxConsumers)
	const handleEnabledCheck = (check: boolean) => onChange?.(check ? initDefault : desiredDefault)

	// RENDER
	const isEnabled = (value != null || initDefault == null) && value !== desiredDefault
	const valueShow = value

	return <div className="lyt-v">
		<div className="jack-cmp-h">
			<IconToggle
				check={isEnabled}
				onChange={handleEnabledCheck}
				readOnly={readOnly}
			/>
			<div className="jack-lbl-prop">{label}</div>
		</div>
		<Accordion open={isEnabled}>
			<div className="jack-cmp-h" style={{ minHeight: 22 }}>
				<NumberInput
					style={{ flex: 1 }}
					value={valueShow}
					onChange={handlePropChange}
					readOnly={readOnly}
					min={min}
					max={max}
				/>
			</div>
		</Accordion>
	</div>
}

export default MaxNumberCmp
