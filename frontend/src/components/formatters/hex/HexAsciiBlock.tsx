import { FunctionComponent, useMemo } from "react"



const regex = /\s/g

interface Props {
	block: Uint8Array
	columns?: number
}

const HexAsciiBlock: FunctionComponent<Props> = ({
	block,
	columns = 8,
}) => {

	const render = useMemo(() => {
		const render = Array.from(block, (value: number) => String.fromCharCode(value))
		return render.join("").replace(regex, " ").padEnd(8," ");
	}, [block, columns])

	return <span
		className="color-fg"
		style={cssRoot}
	>{render}</span>
}

export default HexAsciiBlock

const cssRoot: React.CSSProperties = {
    whiteSpace: "pre",
}