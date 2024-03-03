import Accordion from "@/components/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import ListDialog from "@/components/dialogs/ListDialog"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import NumberInput from "@/components/input/NumberInput"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { StreamConfig } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"



enum TIME {
	SECONDS = "seconds",
	MINUTES = "minutes",
	HOURS = "hours",
	DAYS = "days",
}

interface Props {
	store?: StreamStore
	label?: string
}

const MaxAgeCmp: FunctionComponent<Props> = ({
	store: streamSo,
	label,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs
	const [unit, setUnit] = useState(TIME.SECONDS)

	// HANDLER
	const handlePropChange = (value: number) => {
		const maxAge = valueToSeconds(value, unit)
		streamSo.setStreamConfig({ ...streamSa.stream.config, maxAge })
	}
	const handleEnabledCheck = (check: boolean) => handlePropChange(check ? 0 : -1)
	const handleUnitChange = (index: number) => setUnit(Object.values(TIME)[index])

	// RENDER
	const config: StreamConfig = streamSa.stream.config
	const inRead = streamSa.editState == EDIT_STATE.READ
	const inNew = streamSa.editState == EDIT_STATE.NEW
	const isEnabled = config.maxAge != -1
	const valueShow = secondsToValue(config.maxAge, unit)

	return <BoxV>
		<Box>
			<IconToggle
				check={isEnabled}
				onChange={handleEnabledCheck}
				readOnly={inRead || !inNew}
			/>
			<div className="lbl-prop">{label}</div>

		</Box>
		<Accordion open={isEnabled}>
			<Box style={{ minHeight: 22 }}>
				<NumberInput
					style={{ flex: 1.5 }}
					value={valueShow}
					onChange={handlePropChange}
					readOnly={inRead}
				/>
				<ListDialog width={100}
					store={streamSo}
					select={Object.values(TIME).indexOf(unit ?? TIME.SECONDS)}
					items={Object.values(TIME)}
					RenderRow={({ item }) => item.toUpperCase()}
					readOnly={inRead || !inNew}
					onSelect={handleUnitChange}
				/>
			</Box>
		</Accordion>
	</BoxV>
}

export default MaxAgeCmp

function secondsToValue(value: number, to: TIME) {
	switch (to) {
		case TIME.DAYS:
			return Math.round(value / (60 * 60 * 24))
		case TIME.HOURS:
			return Math.round(value / (60 * 60))
		case TIME.MINUTES:
			return Math.round(value / 60)
		default:
			return value
	}
}

function valueToSeconds(value: number, from: TIME) {
	switch (from) {
		case TIME.DAYS:
			return value * (60 * 60 * 24)
		case TIME.HOURS:
			return value * (60 * 60)
		case TIME.MINUTES:
			return value * 60
		default:
			return value
	}
}