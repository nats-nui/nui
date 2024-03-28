import layoutSo from "@/stores/layout"
import { FunctionComponent, useMemo } from "react"



interface Props {
	block: Uint8Array
	columns?: number
}

const HexBlock: FunctionComponent<Props> = ({
	block,
	columns = 8,
}) => {

	const render = useMemo(()=>{
		const render = Array.from(block,
			(value: number, index: number) => <HexCell key={index} value={value} bgType={index % 2} />
		)
		if (render.length < columns) render.push(...Array.from({length:columns - render.length}, _ => <HexCell />))
		return render
	},[block, columns])

	return render
}

export default HexBlock



interface HexCellProps {
	value?: number
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
	if ( value == null ) return ".."
	return value.toString(16).toUpperCase().padStart(2, '0')
}
