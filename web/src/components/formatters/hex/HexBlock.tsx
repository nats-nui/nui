import { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"



interface Props {
	block: Uint8Array
}

const HexBlock: FunctionComponent<Props> = ({
	block
}) => {
	return Array.from(
		block,
		(value: number, index: number) => <HexCell key={index} value={value} bgType={index % 2} />
	)
}

export default HexBlock



interface HexCellProps {
	value: number
	bgType?: number
}
const HexCell: FunctionComponent<HexCellProps> = ({
	value,
	bgType,
}) => {
	return <span style={bgType == 0 ? cssHex1 : cssHex2}>
		{toHex(value)}
	</span>
}

const cssHex1 = {
	padding: "0px 3px",
}
const cssHex2 = {
	padding: "0px 3px",
	color: layoutSo.state.theme.palette.default.fg2,
}
const toHex = (value: number): string => {
	return value.toString(16).toUpperCase().padStart(2, '0')
}
