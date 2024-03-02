import IconToggle from "@/components/buttons/IconToggle"
import ListDialog from "@/components/dialogs/ListDialog"
import Box from "@/components/format/Box"
import NumberInput from "@/components/input/NumberInput"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { StreamConfig } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"



enum BYTE {
	BYTES = "bytes",
	KIB = "kib",
	MIB = "mib",
	GIB = "gib",
	TIB = "tib",
}

interface Props {
	store?: StreamStore
}

const MaxBytesCmp: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs
	const [unit, setUnit] = useState(BYTE.BYTES)

	// HANDLER
	const handlePropChange = (value: number) => {
		const maxBytes = valueToBytes(value, unit)
		streamSo.setStreamConfig({ ...streamSa.stream.config, maxBytes })
	}
	const handleEnabledCheck = (check: boolean) => handlePropChange(check ? 0 : -1)
	const handleUnitChange = (index: number) => setUnit(Object.values(BYTE)[index])

	// RENDER
	const config: StreamConfig = streamSa.stream.config
	const inRead = streamSa.editState == EDIT_STATE.READ
	const inNew = streamSa.editState == EDIT_STATE.NEW
	const isEnabled = config.maxBytes != -1
	const valueShow = bytesToValue(config.maxBytes, unit)

	return <Box style={{ minHeight: 22 }}>
		<IconToggle
			check={isEnabled}
			onChange={handleEnabledCheck}
			readOnly={inRead || !inNew}
		/>
		{isEnabled && <>
			<NumberInput
				style={{ flex: 1 }}
				value={valueShow}
				onChange={handlePropChange}
				readOnly={inRead}
			/>
			<ListDialog width={100}
				store={streamSo}
				select={Object.values(BYTE).indexOf(unit ?? BYTE.BYTES)}
				items={Object.values(BYTE)}
				RenderRow={({ item }) => item.toUpperCase()}
				readOnly={inRead || !inNew}
				onSelect={handleUnitChange}
			/>
		</>}
	</Box>
}

export default MaxBytesCmp

function bytesToValue(value: number, to: BYTE) {
	switch (to) {
		case BYTE.TIB:
			return Math.round(value / 1099511627776)
		case BYTE.GIB:
			return Math.round(value / 1073741824)
		case BYTE.MIB:
			return Math.round(value / 1048576)
		case BYTE.KIB:
			return Math.round(value / 1024)
		default:
			return value
	}
}

function valueToBytes(value: number, from: BYTE) {
	switch (from) {
		case BYTE.TIB:
			return value * 1099511627776
		case BYTE.GIB:
			return value * 1073741824
		case BYTE.MIB:
			return value * 1048576
		case BYTE.KIB:
			return value * 1024
		default:
			return value
	}
}