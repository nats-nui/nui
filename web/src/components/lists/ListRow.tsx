import layoutSo from "@/stores/layout"


interface Props<T> {
	children?: React.ReactNode
	style?: React.CSSProperties
	readOnly?: boolean
	select?: boolean
	variant?: number
	onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

function ListRow<T>({
	children,
	style,
	select,
	variant,
	readOnly,
	onClick
}: Props<T>) {

	// STORES

	// HOOKS

	// HANDLERS

	// RENDER
	return <div
		style={{ ...cssRoot(readOnly, select, variant), ...style }}
		className={!readOnly ? "cliccable" : null}
		onClick={!readOnly ? onClick : null}
	>
		{children}
	</div>
}

export default ListRow

const cssRoot = (readOnly: boolean, select:boolean, variant:number): React.CSSProperties => ({
	display: "flex",
	borderRadius: 3,
	cursor: !readOnly ? "pointer" : null,
	backgroundColor: select 
		? layoutSo.state.theme.palette.var[variant].bg 
		: null,
	color: select ? layoutSo.state.theme.palette.var[variant].fg : null,
	fontSize: 12,
	fontWeight: 600,
	padding: "4px 3px",
})