import { FunctionComponent } from "react"
import layoutSo, { COLOR_VAR } from "@/stores/layout"



interface Props {
	block: Uint8Array
	columns?: number
}

const HexAsciiBlock: FunctionComponent<Props> = ({
	block,
	columns = 8,
}) => {

	const render = Array.from(block, (value: number) => String.fromCharCode(value))
	if (render.length < columns) render.push(...Array.from({length:columns - render.length}, _ => "."))
	return <span style={cssRoot}>{render}</span>
}

export default HexAsciiBlock

const cssRoot: React.CSSProperties = {
	color: layoutSo.state.theme.palette.var[COLOR_VAR.CYAN].bg,
	whiteSpace: 'nowrap',
}