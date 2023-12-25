import { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"



interface Props {
	block: Uint8Array
}

const HexAsciiBlock: FunctionComponent<Props> = ({
	block
}) => {
	return Array.from(
		block,
		(value: number, index: number) => (
			<span key={index} style={cssRoot}>
				{String.fromCharCode(value)}
			</span>
		)
	)
}

export default HexAsciiBlock

const cssRoot: React.CSSProperties = {
	color: layoutSo.state.theme.palette.var[1].bg,
}