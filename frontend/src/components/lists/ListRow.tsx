import layoutSo from "@/stores/layout"


interface Props<T> {
	children?: React.ReactNode
	style?: React.CSSProperties
	readOnly?: boolean
	isSelect?: boolean
	onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

function ListRow<T>({
	children,
	style,
	isSelect,
	readOnly = false,
	onClick
}: Props<T>) {

	// STORES

	// HOOKS

	// HANDLERS

	// RENDER
	return <div
		style={{ ...cssRoot(readOnly, isSelect), ...style }}
		className={!readOnly ? "cliccable" : null}
		onClick={!readOnly ? onClick : null}
	>
		{children}
	</div>
}

export default ListRow

const cssRoot = (readOnly: boolean, select: boolean): React.CSSProperties => ({
	display: "flex",
	borderRadius: 3,
	cursor: !readOnly ? "pointer" : null,
	...select ? {
		//border: "1px solid rgb(0 0 0 / 15%)",
		backgroundColor: 'rgba(0,0,0,.2)',
		//color: "#FFF"
	} : {
	},
	fontSize: 12,
	fontWeight: 600,
	padding: "4px 3px",
	minHeight: 14,
	wordBreak: "break-all",
})